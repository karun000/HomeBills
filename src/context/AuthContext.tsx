import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile, User as FirebaseUser } from 'firebase/auth';
import { auth, logFirebaseError, logFirebaseEvent } from '../services/firebase';

export type User = { uid: string; name: string; email: string };
type AuthCtx = { user: User | null; initializing: boolean; signIn: (email?: string, password?: string) => Promise<void>; signUp: (name?: string, email?: string, password?: string) => Promise<void>; signOut: () => Promise<void> };
const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);
const mapUser = (u: FirebaseUser): User => ({ uid: u.uid, name: u.displayName || u.email?.split('@')[0] || 'Home Bills user', email: u.email || '' });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    logFirebaseEvent('Auth state listener started');
    return onAuthStateChanged(auth, u => {
      setUser(u ? mapUser(u) : null);
      setInitializing(false);
      logFirebaseEvent('Auth state changed', { authenticated: Boolean(u), uid: u?.uid || null });
    }, error => logFirebaseError('Auth state listener failed', error));
  }, []);
  const signIn = async (email?: string, password?: string) => {
    if (!email || !password) throw new Error('Email and password are required.');
    logFirebaseEvent('Sign-in started');
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      logFirebaseEvent('Sign-in succeeded', { uid: result.user.uid });
    } catch (error) {
      logFirebaseError('Sign-in failed', error);
      throw error;
    }
  };
  const signUp = async (name?: string, email?: string, password?: string) => {
    if (!name || !email || !password) throw new Error('Name, email, and password are required.');
    logFirebaseEvent('Sign-up started');
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      logFirebaseEvent('Account created', { uid: result.user.uid });
      await updateProfile(result.user, { displayName: name.trim() });
      setUser(mapUser(result.user));
      logFirebaseEvent('Profile update succeeded', { uid: result.user.uid });
    } catch (error) {
      logFirebaseError('Sign-up or profile update failed', error);
      throw error;
    }
  };
  const signOut = async () => {
    logFirebaseEvent('Sign-out started', { uid: user?.uid || null });
    try {
      await firebaseSignOut(auth);
      setUser(null);
      logFirebaseEvent('Sign-out succeeded');
    } catch (error) {
      logFirebaseError('Sign-out failed', error);
      throw error;
    }
  };
  return <AuthContext.Provider value={{ user, initializing, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}
