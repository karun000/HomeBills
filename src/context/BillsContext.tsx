import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import * as FileSystem from 'expo-file-system';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Bill, categoryMeta, Status } from '../data/mock';
import { db, logFirebaseError, logFirebaseEvent } from '../services/firebase';
import { useAuth } from './AuthContext';
import { adToBs, todayBs } from '../utils/nepaliDate';

type NewBill = Omit<Bill, 'id' | 'status' | 'icon' | 'tint'> & { status?: Status };
type Ctx = { bills: Bill[]; loading: boolean; syncing: boolean; syncError: string | null; addBill: (b: NewBill) => Promise<Bill>; updateBill: (id: string, p: Partial<Bill>) => Promise<void>; removeBill: (id: string) => Promise<void>; removeBills: (ids: string[]) => Promise<void>; togglePaid: (id: string) => Promise<void> };
const BillsCtx = createContext<Ctx>({} as Ctx);
const isOfflineError = (error: unknown) => {
  const value = error as { code?: string; message?: string };
  return ['unavailable', 'deadline-exceeded', 'failed-precondition', 'network-request-failed'].includes(value?.code || '')
    || /network|offline|timeout|unavailable/i.test(value?.message || '');
};
type StoredBill = Omit<Bill, 'date'> & { date?: string; due?: string };
const statusFor = (paidAt?: string, amount?: number | null): Status => { if (amount == null) return 'Awaiting Reading'; return paidAt ? 'Paid' : 'Unpaid'; };
const normaliseBill = (stored: StoredBill): Bill => {
  const { due, ...bill } = stored;
  const storedDate = stored.date || due || todayBs();
  const year = Number(storedDate.slice(0, 4));
  const date = stored.calendar !== 'bs' && year >= 1900 && year <= 2040 ? adToBs(storedDate) : storedDate;
  return { ...bill, date, calendar: 'bs', status: statusFor(stored.paidAt, stored.amount) };
};
export const useBills = () => useContext(BillsCtx);

export function BillsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth(); const [bills, setBills] = useState<Bill[]>([]); const [loading, setLoading] = useState(true); const [syncing, setSyncing] = useState(false); const [syncError, setSyncError] = useState<string | null>(null);
  const userId = user?.uid;
  const cacheFile = userId ? `${FileSystem.documentDirectory || ''}home-bills-${userId}.json` : '';
  const deletedFile = userId ? `${FileSystem.documentDirectory || ''}home-bills-deleted-${userId}.json` : '';
  const localRef = useRef<Bill[]>([]);
  const deletedRef = useRef<string[]>([]);
  const persistLocal = useCallback(async (next: Bill[]) => {
    localRef.current = next;
    setBills(next);
    logFirebaseEvent('Local bill cache update started', { billCount: next.length, cacheEnabled: Boolean(cacheFile) });
    if (cacheFile) {
      try {
        await FileSystem.writeAsStringAsync(cacheFile, JSON.stringify(next));
        logFirebaseEvent('Local bill cache update succeeded', { billCount: next.length });
      } catch (error) {
        logFirebaseError('Local bill cache update failed', error, { billCount: next.length });
      }
    }
  }, [cacheFile]);
  const persistDeleted = useCallback(async (next: string[]) => {
    deletedRef.current = next;
    logFirebaseEvent('Local deletion queue update started', { queuedDeleteCount: next.length, cacheEnabled: Boolean(deletedFile) });
    if (deletedFile) {
      try {
        await FileSystem.writeAsStringAsync(deletedFile, JSON.stringify(next));
        logFirebaseEvent('Local deletion queue update succeeded', { queuedDeleteCount: next.length });
      } catch (error) {
        logFirebaseError('Local deletion queue update failed', error, { queuedDeleteCount: next.length });
      }
    }
  }, [deletedFile]);
  const cloudWrite = useCallback(async (bill: Bill) => {
    const documentPath = userId ? `users/${userId}/bills/${bill.id}` : null;
    if (!userId || !documentPath) {
      logFirebaseEvent('Bill write skipped: no authenticated user', { billId: bill.id });
      return;
    }
    try {
      logFirebaseEvent('Firestore bill write started', { uid: userId, documentPath });
      setSyncing(true);
      const clean = Object.fromEntries(Object.entries({ ...bill, updatedAt: bill.updatedAt || Date.now() }).filter(([, value]) => value !== undefined));
      await setDoc(doc(db, 'users', userId, 'bills', bill.id), clean);
      setSyncError(null);
      logFirebaseEvent('Firestore bill write succeeded', { uid: userId, documentPath });
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Could not sync bills with Firebase.');
      logFirebaseError('Firestore bill write failed', error, { uid: userId, documentPath });
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [userId]);
  useEffect(() => {
    let unsubscribe: undefined | (() => void); let retry: ReturnType<typeof setInterval> | undefined; let active = true;
    setLoading(true); setBills([]); setSyncError(null);
    logFirebaseEvent('Bills provider user session changed', { authenticated: Boolean(userId), uid: userId || null });
    if (!userId) { setLoading(false); logFirebaseEvent('Cloud bill sync skipped: no authenticated user'); return () => {}; }
    (async () => {
      let local: Bill[] = []; let deleted: string[] = [];
      try {
        local = (JSON.parse(await FileSystem.readAsStringAsync(cacheFile)) as StoredBill[]).map(normaliseBill);
        logFirebaseEvent('Local bill cache loaded', { billCount: local.length });
      } catch (error) {
        logFirebaseError('Local bill cache unavailable or invalid', error);
      }
      try {
        deleted = JSON.parse(await FileSystem.readAsStringAsync(deletedFile)) as string[];
        logFirebaseEvent('Local deletion queue loaded', { queuedDeleteCount: deleted.length });
      } catch (error) {
        logFirebaseError('Local deletion queue unavailable or invalid', error);
      }
      localRef.current = local; deletedRef.current = deleted;
      if (active) { setBills(local); setLoading(false); }
      const startCloudListener = async () => {
        if (!active || unsubscribe) return;
        const collectionPath = `users/${userId}/bills`;
        logFirebaseEvent('Firestore bill listener starting', { uid: userId, collectionPath });
        unsubscribe = onSnapshot(collection(db, 'users', userId, 'bills'), async snapshot => {
          const remote = snapshot.docs.map(d => {
            const stored = d.data() as StoredBill;
            const bill = normaliseBill(stored);
            if (stored.due !== undefined) void cloudWrite(bill).catch(() => {});
            return bill;
          });
          logFirebaseEvent('Firestore bill snapshot received', {
            uid: userId,
            collectionPath,
            remoteBillCount: remote.length,
            fromCache: snapshot.metadata.fromCache,
            hasPendingWrites: snapshot.metadata.hasPendingWrites,
          });
          const removed = new Set(deletedRef.current);
          const remoteById = new Map(remote.filter((bill) => !removed.has(bill.id)).map(b => [b.id, b]));
          if (removed.size) {
            try {
              logFirebaseEvent('Queued Firestore bill deletions started', { uid: userId, deleteCount: removed.size });
              await Promise.all([...removed].map(id => deleteDoc(doc(db, 'users', userId, 'bills', id))));
              await persistDeleted([]);
              logFirebaseEvent('Queued Firestore bill deletions succeeded', { uid: userId, deleteCount: removed.size });
            } catch (error) {
              logFirebaseError('Queued Firestore bill deletions failed', error, { uid: userId, deleteCount: removed.size });
              if (!isOfflineError(error)) setSyncError(error instanceof Error ? error.message : 'Could not delete bills from Firebase.');
            }
          }
          const currentLocal = localRef.current;
          logFirebaseEvent('Bill sync reconciliation started', { localBillCount: currentLocal.length, remoteBillCount: remote.length });
          for (const bill of currentLocal) {
            const cloud = remoteById.get(bill.id);
            if (!cloud || (bill.updatedAt || 0) > (cloud.updatedAt || 0)) {
              try { await cloudWrite(bill); } catch {}
            }
          }
          if (active) {
            const merged = [...remoteById.values()]; const mergedIds = new Set(merged.map(b => b.id));
            currentLocal.filter(b => !removed.has(b.id) && !mergedIds.has(b.id)).forEach(b => merged.push(b));
            currentLocal.forEach(b => { const i = merged.findIndex(x => x.id === b.id); if (i >= 0 && (b.updatedAt || 0) > (merged[i].updatedAt || 0)) merged[i] = b; });
            await persistLocal(merged);
            logFirebaseEvent('Bill sync reconciliation completed', { mergedBillCount: merged.length });
          }
        }, (error) => {
          unsubscribe?.(); unsubscribe = undefined;
          logFirebaseError('Firestore bill listener failed', error, { uid: userId, collectionPath });
          if (!isOfflineError(error)) setSyncError(error.message || 'Could not read bills from Firebase.');
        });
      };
      await startCloudListener();
      if (!active) return;
      logFirebaseEvent('Firestore listener retry timer scheduled', { intervalMs: 15000 });
      retry = setInterval(startCloudListener, 15000);
    })();
    return () => { active = false; unsubscribe?.(); if (retry) clearInterval(retry); };
  }, [userId, cacheFile, deletedFile, cloudWrite, persistDeleted, persistLocal]);
  const addBill = useCallback(async (input: NewBill) => { const meta = categoryMeta[input.category] || { icon: 'mdi:file-document-outline', tint: '#1F6FEB' }; const b: Bill = { ...input, id: `${Date.now()}-${Math.random()}`, icon: meta.icon, tint: meta.tint, calendar: 'bs', status: statusFor(input.paidAt, input.amount), updatedAt: Date.now() }; const next = [b, ...bills]; await persistLocal(next); await cloudWrite(b); return b; }, [bills, cloudWrite, persistLocal]);
  const updateBill = useCallback(async (id: string, p: Partial<Bill>) => { const current = bills.find(b => b.id === id); if (!current) return; const updated = { ...current, ...p, calendar: 'bs' as const, status: statusFor(p.paidAt === undefined ? current.paidAt : p.paidAt, p.amount === undefined ? current.amount : p.amount), updatedAt: Date.now() }; await persistLocal(bills.map(b => b.id === id ? updated : b)); await cloudWrite(updated); }, [bills, cloudWrite, persistLocal]);
  const removeBills = useCallback(async (ids: string[]) => {
    const idSet = new Set(ids);
    await persistLocal(bills.filter(b => !idSet.has(b.id)));
    logFirebaseEvent('Bill deletion requested', { requestedDeleteCount: ids.length, authenticated: Boolean(userId), uid: userId || null });
    if (userId) void (async () => {
      try {
        setSyncing(true);
        logFirebaseEvent('Firestore bill deletions started', { uid: userId, deleteCount: idSet.size });
        await Promise.all([...idSet].map(id => deleteDoc(doc(db, 'users', userId, 'bills', id))));
        await persistDeleted(deletedRef.current.filter(id => !idSet.has(id)));
        setSyncError(null);
        logFirebaseEvent('Firestore bill deletions succeeded', { uid: userId, deleteCount: idSet.size });
      } catch (error) {
        logFirebaseError('Firestore bill deletions failed', error, { uid: userId, deleteCount: idSet.size });
        if (isOfflineError(error)) {
          await persistDeleted([...new Set([...deletedRef.current, ...idSet])]);
          logFirebaseEvent('Firestore deletions queued for retry', { queuedDeleteCount: deletedRef.current.length });
        } else setSyncError(error instanceof Error ? error.message : 'Could not delete bills from Firebase.');
      } finally {
        setSyncing(false);
      }
    })();
  }, [bills, persistDeleted, persistLocal, userId]);
  const removeBill = useCallback(async (id: string) => removeBills([id]), [removeBills]);
  const togglePaid = useCallback(async (id: string) => { const b = bills.find(x => x.id === id); if (b) await updateBill(id, { paidAt: b.paidAt ? undefined : new Date().toISOString() }); }, [bills, updateBill]);
  const value = useMemo(() => ({ bills, loading, syncing, syncError, addBill, updateBill, removeBill, removeBills, togglePaid }), [bills, loading, syncing, syncError, addBill, updateBill, removeBill, removeBills, togglePaid]);
  return <BillsCtx.Provider value={value}>{children}</BillsCtx.Provider>;
}
