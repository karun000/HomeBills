import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
import * as authSdk from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as FileSystem from 'expo-file-system';

type FirebaseLogDetails = Record<string, unknown>;
type FirebaseErrorInfo = { code?: string; message?: string };

export const logFirebaseEvent = (event: string, details: FirebaseLogDetails = {}) => {
  console.log('[HomeBills Firebase]', {
    at: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    event,
    ...details,
  });
};

export const logFirebaseError = (event: string, error: unknown, details: FirebaseLogDetails = {}) => {
  const info = error as FirebaseErrorInfo;
  console.error('[HomeBills Firebase]', {
    at: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    event,
    ...details,
    code: info?.code || 'unknown',
    message: info?.message || String(error),
  });
};

export const firebaseConfig = {
  apiKey: 'AIzaSyBetwSGqrLKtt5FP15rFLIdMKe764mA3JI',
  authDomain: 'homebills-d3980.firebaseapp.com',
  projectId: 'homebills-d3980',
  storageBucket: 'homebills-d3980.firebasestorage.app',
  messagingSenderId: '737488387687',
  appId: '1:737488387687:web:1b439db68461b168299ec2',
  measurementId: 'G-Q5PZGVSWL0',
};

const app = initializeApp(firebaseConfig);
// Firebase's RN persistence adapter only requires this small async-storage shape.
// FileSystem keeps the auth session available even when AsyncStorage is not installed.
const authStore = {
  async getItem(key: string) {
    try { return await FileSystem.readAsStringAsync(`${FileSystem.documentDirectory || ''}firebase-auth-${encodeURIComponent(key)}`); } catch { return null; }
  },
  async setItem(key: string, value: string) {
    await FileSystem.writeAsStringAsync(`${FileSystem.documentDirectory || ''}firebase-auth-${encodeURIComponent(key)}`, value);
  },
  async removeItem(key: string) {
    try { await FileSystem.deleteAsync(`${FileSystem.documentDirectory || ''}firebase-auth-${encodeURIComponent(key)}`, { idempotent: true }); } catch {}
  },
};
const getReactNativePersistence = (authSdk as unknown as { getReactNativePersistence: (store: typeof authStore) => Parameters<typeof initializeAuth>[1] extends { persistence?: infer P } ? P : never }).getReactNativePersistence;
export const auth = getReactNativePersistence
  ? initializeAuth(app, { persistence: getReactNativePersistence(authStore) })
  : initializeAuth(app);
export const db = getFirestore(app);
logFirebaseEvent('Firebase client initialized', { authPersistence: Boolean(getReactNativePersistence) });
