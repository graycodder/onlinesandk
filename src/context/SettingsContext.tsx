import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StoreSettings } from '../types';
import { getStoreSettings, updateStoreSettings as saveSettingsService } from '../services/settingsService';
import { initialStoreSettings } from '../services/seedData';

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (updates: Partial<StoreSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(initialStoreSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await getStoreSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Could not refresh store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    const updated = await saveSettingsService(updates);
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
