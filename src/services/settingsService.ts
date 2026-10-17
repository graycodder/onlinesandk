import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import type { StoreSettings } from '../types';
import { initialStoreSettings } from './seedData';
import { cleanWhatsAppNumber } from '../utils/formatters';

const STORAGE_KEY = 'sash_knot_local_settings';

const getLocalSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStoreSettings));
      return initialStoreSettings;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading local settings, using default:', err);
    return initialStoreSettings;
  }
};

const saveLocalSettings = (settings: StoreSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving local settings:', err);
  }
};

export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'store');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<StoreSettings>;
        return {
          ...initialStoreSettings,
          ...data,
        };
      }
    } catch (err) {
      console.warn('Firestore settings fetch failed, using local/default:', err);
    }
  }

  return getLocalSettings();
};

export const updateStoreSettings = async (updates: Partial<StoreSettings>): Promise<StoreSettings> => {
  const current = await getStoreSettings();
  
  // Clean WhatsApp number if changed
  let cleanedWhatsApp = updates.whatsappNumber ? cleanWhatsAppNumber(updates.whatsappNumber) : current.whatsappNumber;

  const merged: StoreSettings = {
    ...current,
    ...updates,
    whatsappNumber: cleanedWhatsApp,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'settings', 'store');
      await setDoc(docRef, {
        ...merged,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error saving settings to Firestore:', err);
      throw err;
    }
  }

  saveLocalSettings(merged);
  return merged;
};
