import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import type { AdminUser } from '../types';

// The designated owner / super-admin email for this store
const OWNER_EMAIL = 'onlinesandk@gmail.com';

const DEMO_ADMIN_SESSION_KEY = 'sash_knot_demo_admin_session';

// Map username to email
export const mapUsernameToEmail = (usernameOrEmail: string): string => {
  const trimmed = usernameOrEmail.trim().toLowerCase();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Standard username mapping to business domain
  return `${trimmed}@sashandknot.com`;
};

/**
 * Check if the authenticated user has verified administrator privileges.
 * 1. Checks custom claims (e.g. user.getIdTokenResult().claims.admin)
 * 2. Checks Firestore /admins/{uid} collection document
 * 3. Auto-bootstraps the owner email (onlinesandk@gmail.com) on first login
 */
export const verifyAdminPermission = async (user: User): Promise<boolean> => {
  try {
    // 1. Check custom claims
    const tokenResult = await user.getIdTokenResult(true);
    if (tokenResult.claims.admin === true) {
      return true;
    }

    if (db) {
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      // 2. Check existing Firestore /admins document
      if (adminDoc.exists() && adminDoc.data()?.active === true) {
        return true;
      }

      // 3. Auto-bootstrap: owner email creates their own admin doc on first login
      if (user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() && !adminDoc.exists()) {
        await setDoc(adminDocRef, {
          active: true,
          email: user.email,
          role: 'super_admin',
          displayName: 'Store Administrator',
          createdAt: new Date().toISOString(),
          uid: user.uid,
        });
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('Error verifying admin authorization:', err);
    return false;
  }
};

/**
 * Admin Sign-in
 */
export const signInAdmin = async (
  usernameOrEmail: string,
  password: string
): Promise<AdminUser> => {
  const email = mapUsernameToEmail(usernameOrEmail);

  if (isFirebaseConfigured() && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify admin privileges
      const isAdmin = await verifyAdminPermission(user);
      if (!isAdmin) {
        await firebaseSignOut(auth);
        throw new Error('Access denied. This account does not possess administrator privileges.');
      }

      return {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || 'Administrator',
        isAdmin: true,
      };
    } catch (err: any) {
      // Handle Firebase Auth errors cleanly
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        throw new Error('Invalid credentials. Please verify your username and password.');
      } else if (err.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again in a few minutes.');
      }
      throw err;
    }
  }

  // Demo fallback when Firebase Auth is not yet connected
  if (
    (usernameOrEmail.trim().toLowerCase() === 'admin' || usernameOrEmail.trim().toLowerCase() === 'admin@sashandknot.com') &&
    password === 'sashandknot2026'
  ) {
    const demoAdmin: AdminUser = {
      uid: 'demo-admin-uid-1',
      email: 'admin@sashandknot.com',
      displayName: 'Sash & Knot Admin',
      isAdmin: true,
    };
    sessionStorage.setItem(DEMO_ADMIN_SESSION_KEY, JSON.stringify(demoAdmin));
    return demoAdmin;
  }

  throw new Error('Invalid credentials. (For demo testing without Firebase, use: admin / sashandknot2026)');
};

/**
 * Admin Sign-out
 */
export const signOutAdmin = async (): Promise<void> => {
  sessionStorage.removeItem(DEMO_ADMIN_SESSION_KEY);
  if (isFirebaseConfigured() && auth) {
    await firebaseSignOut(auth);
  }
};

/**
 * Subscribe to Admin Auth State
 */
export const subscribeToAdminAuth = (
  callback: (user: AdminUser | null) => void
): (() => void) => {
  if (isFirebaseConfigured() && auth) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await verifyAdminPermission(user);
        if (isAdmin) {
          callback({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Administrator',
            isAdmin: true,
          });
          return;
        }
      }
      callback(null);
    });
  }

  // Check demo session
  const rawSession = sessionStorage.getItem(DEMO_ADMIN_SESSION_KEY);
  if (rawSession) {
    try {
      const demoUser = JSON.parse(rawSession) as AdminUser;
      callback(demoUser);
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }

  return () => {};
};
