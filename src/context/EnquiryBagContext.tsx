import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BagItem } from '../types';

interface EnquiryBagContextType {
  items: BagItem[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  addToBag: (item: Omit<BagItem, 'id'>) => void;
  removeFromBag: (id: string) => void;
  updateQuantity: (id: string, deltaOrQuantity: number, isAbsolute?: boolean) => void;
  clearBag: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const BAG_STORAGE_KEY = 'sash_knot_enquiry_bag';

const EnquiryBagContext = createContext<EnquiryBagContextType | undefined>(undefined);

export const EnquiryBagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BagItem[]>(() => {
    try {
      const stored = localStorage.getItem(BAG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Could not read enquiry bag from localStorage, resetting:', err);
    }
    return [];
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving enquiry bag to localStorage:', err);
    }
  }, [items]);

  const addToBag = (newItem: Omit<BagItem, 'id'>) => {
    // Composite ID guarantees distinct variations are stored as separate line items
    const compositeId = `${newItem.productId}_${newItem.selectedSize || 'standard'}_${newItem.selectedColour || 'standard'}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === compositeId);

      if (existingIndex > -1) {
        // Increment quantity of existing variation
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
        return updated;
      } else {
        // Add as new line item
        return [...prevItems, { ...newItem, id: compositeId }];
      }
    });

    setIsDrawerOpen(true);
  };

  const removeFromBag = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, val: number, isAbsolute = false) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = isAbsolute ? val : item.quantity + val;
            return {
              ...item,
              quantity: Math.max(1, Math.min(nextQty, 50)), // clamp between 1 and 50
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearBag = () => {
    setItems([]);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const itemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  return (
    <EnquiryBagContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isDrawerOpen,
        addToBag,
        removeFromBag,
        updateQuantity,
        clearBag,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </EnquiryBagContext.Provider>
  );
};

export const useEnquiryBag = (): EnquiryBagContextType => {
  const context = useContext(EnquiryBagContext);
  if (!context) {
    throw new Error('useEnquiryBag must be used within an EnquiryBagProvider');
  }
  return context;
};
