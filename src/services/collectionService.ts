import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import type { Collection } from '../types';
import { initialCollections } from './seedData';
import { slugify } from '../utils/formatters';
import { getAllProductsAdmin } from './productService';

const STORAGE_KEY = 'sash_knot_local_collections';

const getLocalCollections = (): Collection[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCollections));
      return initialCollections;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading local collections, using defaults', err);
    return initialCollections;
  }
};

const saveLocalCollections = (collections: Collection[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch (err) {
    console.error('Error saving local collections', err);
  }
};

export const getPublishedCollections = async (): Promise<Collection[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      // Query solely by status to avoid Firestore requiring a composite index.
      // Sorting by displayOrder is performed in memory.
      const q = query(
        collection(db, 'collections'),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Collection[];
        const sorted = items.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        saveLocalCollections(sorted);
        return sorted;
      }
    } catch (err) {
      console.warn('Firestore collections query error, using local fallback:', err);
    }
  }

  return getLocalCollections()
    .filter((c) => c.status === 'published')
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
};

export const getAllCollectionsAdmin = async (): Promise<Collection[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'collections'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Collection[];
        const sorted = items.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        saveLocalCollections(sorted);
        return sorted;
      } else {
        // Auto-seed initial collections to Firestore so they exist as real documents
        try {
          for (const col of initialCollections) {
            const colRef = doc(db, 'collections', col.id);
            await setDoc(colRef, {
              ...col,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          saveLocalCollections(initialCollections);
          return initialCollections;
        } catch (seedErr) {
          console.warn('Auto-seed collections failed:', seedErr);
        }
      }
    } catch (err) {
      console.warn('Firestore admin collections query error:', err);
      // In case admin permissions prevented reading all docs, attempt published query
      try {
        const pub = await getPublishedCollections();
        if (pub.length > 0) return pub;
      } catch (pubErr) {
        console.warn('Fallback published query failed:', pubErr);
      }
    }
  }

  return getLocalCollections().sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
};

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  // First attempt from published collections (in-memory match by slug or id)
  try {
    const published = await getPublishedCollections();
    const found = published.find((c) => c.slug === slug || c.id === slug);
    if (found) return found;
  } catch (err) {
    console.warn('Error reading published collections for slug lookup:', err);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'collections', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Collection;
      }
    } catch (err) {
      console.warn('Firestore collection direct id lookup error:', err);
    }
  }

  const all = getLocalCollections();
  return all.find((c) => (c.slug === slug || c.id === slug) && c.status === 'published') || null;
};

export const getCollectionById = async (id: string): Promise<Collection | null> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'collections', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Collection;
      }
    } catch (err) {
      console.warn('Firestore getCollectionById error:', err);
    }
  }

  const all = getLocalCollections();
  return all.find((c) => c.id === id) || null;
};

export const createCollection = async (collectionData: Omit<Collection, 'id'>): Promise<string> => {
  const cleanSlug = collectionData.slug ? slugify(collectionData.slug) : slugify(collectionData.name);
  const now = new Date().toISOString();
  let createdId = `col-${Date.now()}`;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, 'collections'), {
        ...collectionData,
        slug: cleanSlug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      createdId = docRef.id;
    } catch (err) {
      console.error('Error creating collection in Firestore:', err);
      throw err;
    }
  }

  // Dual-write to localStorage so local fallback always has the new collection
  const newCol: Collection = {
    ...collectionData,
    id: createdId,
    slug: cleanSlug,
    createdAt: now,
    updatedAt: now,
  };
  const list = getLocalCollections().filter((c) => c.id !== createdId);
  list.push(newCol);
  saveLocalCollections(list);
  return createdId;
};

export const updateCollection = async (id: string, updates: Partial<Collection>): Promise<void> => {
  const updatedSlug = updates.slug ? slugify(updates.slug) : (updates.name ? slugify(updates.name) : undefined);
  const cleanUpdates = { ...updates };
  if (updatedSlug) cleanUpdates.slug = updatedSlug;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'collections', id);
      const existingDoc = await getDoc(docRef);
      
      if (!existingDoc.exists()) {
        const fallbackCol = initialCollections.find((c) => c.id === id) ||
          getLocalCollections().find((c) => c.id === id);
        await setDoc(
          docRef,
          {
            ...(fallbackCol || {}),
            ...cleanUpdates,
            id,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          docRef,
          {
            ...cleanUpdates,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.error('Error updating collection in Firestore:', err);
      throw err;
    }
  }

  // Dual-write to localStorage
  const list = getLocalCollections();
  const index = list.findIndex((c) => c.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    };
  } else {
    list.push({
      id,
      name: updates.name || 'Collection',
      slug: cleanUpdates.slug || id,
      description: updates.description || '',
      coverImage: updates.coverImage || '',
      displayOrder: updates.displayOrder || 1,
      status: updates.status || 'published',
      updatedAt: new Date().toISOString(),
      ...cleanUpdates,
    });
  }
  saveLocalCollections(list);
};

export const deleteCollection = async (id: string): Promise<void> => {
  // Prevent accidental deletion if products still belong to this collection
  const allProducts = await getAllProductsAdmin();
  const linkedProducts = allProducts.filter((p) => p.categoryId === id);
  if (linkedProducts.length > 0) {
    throw new Error(
      `Cannot delete collection because ${linkedProducts.length} product(s) are currently assigned to it. Please reassign those products first.`
    );
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'collections', id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error deleting collection from Firestore:', err);
      throw err;
    }
  }

  const list = getLocalCollections().filter((c) => c.id !== id);
  saveLocalCollections(list);
};

export const toggleCollectionStatus = async (
  id: string,
  currentStatus: 'published' | 'draft'
): Promise<'published' | 'draft'> => {
  const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
  await updateCollection(id, { status: nextStatus });
  return nextStatus;
};

