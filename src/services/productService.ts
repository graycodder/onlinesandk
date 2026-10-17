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
import type { Product, ProductStatus } from '../types';
import { initialProducts } from './seedData';
import { slugify } from '../utils/formatters';

const STORAGE_KEY = 'sash_knot_local_products';

const getLocalProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading local products, using defaults', err);
    return initialProducts;
  }
};

const saveLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving local products', err);
  }
};

export const getPublishedProducts = async (): Promise<Product[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, 'products'),
        where('status', '==', 'published'),
        orderBy('displayOrder', 'asc')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Product[];
      }
    } catch (err) {
      console.warn('Firestore query error, falling back to local dataset:', err);
    }
  }

  // Fallback to local products
  const all = getLocalProducts();
  return all.filter((p) => p.status === 'published').sort((a, b) => a.displayOrder - b.displayOrder);
};

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'products'), orderBy('displayOrder', 'asc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Product[];
      } else {
        // Auto-seed initial products to Firestore so they exist as real documents
        try {
          for (const prod of initialProducts) {
            const prodRef = doc(db, 'products', prod.id);
            await setDoc(prodRef, {
              ...prod,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
          return initialProducts;
        } catch (seedErr) {
          console.warn('Auto-seed products failed:', seedErr);
        }
      }
    } catch (err) {
      console.warn('Firestore admin query error, falling back to local dataset:', err);
    }
  }

  return getLocalProducts().sort((a, b) => a.displayOrder - b.displayOrder);
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, 'products'),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
    } catch (err) {
      console.warn('Firestore slug query error:', err);
    }
  }

  const all = getLocalProducts();
  return all.find((p) => p.slug === slug && p.status === 'published') || null;
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
    } catch (err) {
      console.warn('Firestore getProductById error:', err);
    }
  }

  const all = getLocalProducts();
  return all.find((p) => p.id === id) || null;
};

export const createProduct = async (productData: Omit<Product, 'id'>): Promise<string> => {
  const cleanSlug = productData.slug ? slugify(productData.slug) : slugify(productData.name);
  const now = new Date().toISOString();

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        slug: cleanSlug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Error creating product in Firestore:', err);
      throw err;
    }
  }

  const newId = `prod-${Date.now()}`;
  const newProduct: Product = {
    ...productData,
    id: newId,
    slug: cleanSlug,
    createdAt: now,
    updatedAt: now,
  };
  const list = getLocalProducts();
  list.unshift(newProduct);
  saveLocalProducts(list);
  return newId;
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  const updatedSlug = updates.slug ? slugify(updates.slug) : (updates.name ? slugify(updates.name) : undefined);
  const cleanUpdates = { ...updates };
  if (updatedSlug) cleanUpdates.slug = updatedSlug;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', id);
      const existingDoc = await getDoc(docRef);
      if (!existingDoc.exists()) {
        // Document didn't exist in Firestore yet (e.g. initial seed product)
        const fallbackProd = initialProducts.find((p) => p.id === id) ||
          getLocalProducts().find((p) => p.id === id);
        await setDoc(
          docRef,
          {
            ...(fallbackProd || {}),
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
      console.error('Error updating product in Firestore:', err);
      throw err;
    }
  }

  const list = getLocalProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    };
    saveLocalProducts(list);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      return;
    } catch (err) {
      console.error('Error deleting product from Firestore:', err);
      throw err;
    }
  }

  const list = getLocalProducts().filter((p) => p.id !== id);
  saveLocalProducts(list);
};

export const toggleProductStatus = async (id: string, currentStatus: ProductStatus): Promise<ProductStatus> => {
  const nextStatus: ProductStatus = currentStatus === 'published' ? 'draft' : 'published';
  await updateProduct(id, { status: nextStatus });
  return nextStatus;
};
