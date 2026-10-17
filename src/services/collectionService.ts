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
  orderBy,
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
      const q = query(
        collection(db, 'collections'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Collection[];
      }
    } catch (err) {
      console.warn('Firestore collections query error, using local fallback:', err);
    }
  }

  return getLocalCollections()
    .filter((c) => c.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);
};

export const getAllCollectionsAdmin = async (): Promise<Collection[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'collections'), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Collection[];
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
          return initialCollections;
        } catch (seedErr) {
          console.warn('Auto-seed collections failed:', seedErr);
        }
      }
    } catch (err) {
      console.warn('Firestore admin collections query error:', err);
    }
  }

  return getLocalCollections().sort((a, b) => a.displayOrder - b.displayOrder);
};

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, 'collections'),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Collection;
      }
    } catch (err) {
      console.warn('Firestore collection slug query error:', err);
    }
  }

  const all = getLocalCollections();
  return all.find((c) => c.slug === slug && c.status === 'published') || null;
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

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, 'collections'), {
        ...collectionData,
        slug: cleanSlug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating collection in Firestore:', err);
      throw err;
    }
  }

  const newId = `col-${Date.now()}`;
  const newCol: Collection = {
    ...collectionData,
    id: newId,
    slug: cleanSlug,
    createdAt: now,
    updatedAt: now,
  };
  const list = getLocalCollections();
  list.push(newCol);
  saveLocalCollections(list);
  return newId;
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
        // Document didn't exist in Firestore yet (e.g. initial seed item)
        // Find default base collection so full document is saved
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
      return;
    } catch (err) {
      console.error('Error updating collection in Firestore:', err);
      throw err;
    }
  }

  const list = getLocalCollections();
  const index = list.findIndex((c) => c.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalCollections(list);
  }
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
      return;
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

