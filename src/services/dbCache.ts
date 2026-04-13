/**
 * IndexedDB cache for raw Supabase row arrays.
 *
 * Stores per-table row arrays keyed by `${lang}:${loc}:${table}`. Bump
 * CACHE_VERSION to invalidate every cached entry after a schema or
 * transform change.
 */

const DB_NAME = 'tabiya-taxonomy-cache';
const STORE_NAME = 'rows';
const CACHE_VERSION = 1;
const FRESHNESS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry<T> {
  version: number;
  storedAt: number;
  rows: T[];
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function cacheKey(lang: string, loc: string, table: string): string {
  return `${lang}:${loc}:${table}`;
}

export async function getCachedRows<T>(
  lang: string,
  loc: string,
  table: string
): Promise<T[] | null> {
  try {
    const db = await openDb();
    const entry = await new Promise<CacheEntry<T> | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(cacheKey(lang, loc, table));
      req.onsuccess = () => resolve(req.result as CacheEntry<T> | undefined);
      req.onerror = () => reject(req.error);
    });
    if (!entry || entry.version !== CACHE_VERSION) return null;
    if (Date.now() - entry.storedAt > FRESHNESS_MS) return null;
    return entry.rows;
  } catch (err) {
    console.warn('[dbCache] read failed', table, err);
    return null;
  }
}

export async function setCachedRows<T>(
  lang: string,
  loc: string,
  table: string,
  rows: T[]
): Promise<void> {
  try {
    const db = await openDb();
    const entry: CacheEntry<T> = {
      version: CACHE_VERSION,
      storedAt: Date.now(),
      rows,
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(entry, cacheKey(lang, loc, table));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[dbCache] write failed', table, err);
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[dbCache] clear failed', err);
  }
}
