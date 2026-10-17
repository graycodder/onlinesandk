import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AdminUser } from '../types';
import {
  signInAdmin,
  signOutAdmin,
  subscribeToAdminAuth,
} from '../services/authService';
import { isFirebaseConfigured } from '../config/firebase';

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  isFirebaseActive: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseActive = isFirebaseConfigured();

  useEffect(() => {
    const unsubscribe = subscribeToAdminAuth((user) => {
      setAdmin(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<AdminUser> => {
    setLoading(true);
    try {
      const user = await signInAdmin(usernameOrEmail, password);
      setAdmin(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await signOutAdmin();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isFirebaseActive,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
