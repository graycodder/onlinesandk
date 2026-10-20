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
      // Query solely by status to avoid Firestore requiring a composite index.
      // Sorting by displayOrder is performed in memory.
      const q = query(
        collection(db, 'products'),
        where('status', '==', 'published')
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Product[];
        const sorted = items.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        saveLocalProducts(sorted);
        return sorted;
      }
    } catch (err) {
      console.warn('Firestore query error, falling back to local dataset:', err);
    }
  }

  // Fallback to local products
  const all = getLocalProducts();
  return all
    .filter((p) => p.status === 'published')
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
};

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Product[];
        const sorted = items.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
        saveLocalProducts(sorted);
        return sorted;
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
          saveLocalProducts(initialProducts);
          return initialProducts;
        } catch (seedErr) {
          console.warn('Auto-seed products failed:', seedErr);
        }
      }
    } catch (err) {
      console.warn('Firestore admin query error, falling back to local dataset:', err);
      // In case admin read permissions failed, attempt published read
      try {
        const pub = await getPublishedProducts();
        if (pub.length > 0) return pub;
      } catch (pubErr) {
        console.warn('Fallback published products failed:', pubErr);
      }
    }
  }

  return getLocalProducts().sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  // First attempt from published products (in-memory match by slug or id)
  try {
    const published = await getPublishedProducts();
    const found = published.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;
  } catch (err) {
    console.warn('Error reading published products for slug lookup:', err);
  }

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
    } catch (err) {
      console.warn('Firestore product direct id lookup error:', err);
    }
  }

  const all = getLocalProducts();
  return all.find((p) => (p.slug === slug || p.id === slug) && p.status === 'published') || null;
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
  let createdId = `prod-${Date.now()}`;

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        slug: cleanSlug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      createdId = docRef.id;
    } catch (err) {
      console.error('Error creating product in Firestore:', err);
      throw err;
    }
  }

  // Dual-write to localStorage
  const newProduct: Product = {
    ...productData,
    id: createdId,
    slug: cleanSlug,
    createdAt: now,
    updatedAt: now,
  };
  const list = getLocalProducts().filter((p) => p.id !== createdId);
  list.unshift(newProduct);
  saveLocalProducts(list);
  return createdId;
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
    } catch (err) {
      console.error('Error updating product in Firestore:', err);
      throw err;
    }
  }

  // Dual-write to localStorage
  const list = getLocalProducts();
  const index = list.findIndex((p) => p.id === id);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      ...cleanUpdates,
      updatedAt: new Date().toISOString(),
    };
  } else {
    list.unshift({
      id,
      name: updates.name || 'Product',
      slug: cleanUpdates.slug || id,
      shortDescription: updates.shortDescription || '',
      description: updates.description || '',
      price: updates.price || 0,
      categoryId: updates.categoryId || '',
      categoryName: updates.categoryName || '',
      images: updates.images || [],
      primaryImage: updates.primaryImage || '',
      sizes: updates.sizes || [],
      colours: updates.colours || [],
      featured: updates.featured || false,
      newArrival: updates.newArrival ?? true,
      status: updates.status || 'published',
      displayOrder: updates.displayOrder || 1,
      updatedAt: new Date().toISOString(),
      ...cleanUpdates,
    });
  }
  saveLocalProducts(list);
};

export const deleteProduct = async (id: string): Promise<void> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
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
