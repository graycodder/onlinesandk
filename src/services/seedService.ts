import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { initialCollections, initialProducts, initialStoreSettings } from './seedData';

export const seedCatalogueToDatabase = async (): Promise<{
  collectionsCount: number;
  productsCount: number;
}> => {
  if (isFirebaseConfigured() && db) {
    // 1. Seed Collections
    for (const col of initialCollections) {
      const colRef = doc(db, 'collections', col.id);
      await setDoc(colRef, {
        ...col,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 2. Seed Products
    for (const prod of initialProducts) {
      const prodRef = doc(db, 'products', prod.id);
      await setDoc(prodRef, {
        ...prod,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // 3. Seed Store Settings
    const settingsRef = doc(db, 'settings', 'store');
    await setDoc(settingsRef, {
      ...initialStoreSettings,
      updatedAt: serverTimestamp(),
    });

    return {
      collectionsCount: initialCollections.length,
      productsCount: initialProducts.length,
    };
  }

  // Local storage seed reset
  localStorage.setItem('sash_knot_local_collections', JSON.stringify(initialCollections));
  localStorage.setItem('sash_knot_local_products', JSON.stringify(initialProducts));
  localStorage.setItem('sash_knot_local_settings', JSON.stringify(initialStoreSettings));

  return {
    collectionsCount: initialCollections.length,
    productsCount: initialProducts.length,
  };
};
