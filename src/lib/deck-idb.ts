import type { StoredDeck } from "@/lib/study-deck-types";
import { DEMO_KEYS } from "@/lib/client-demo-storage";
import { sanitizeStoredDeck } from "@/lib/deck-sanitize";

const DB_NAME = "adal_deck_blob_v1";
const STORE = "decks";
const DB_VERSION = 1;

function storeKey(userId: string, deckId: string) {
  return `${userId}::${deckId}`;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

export async function idbPutDeck(userId: string, deck: StoredDeck): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb write"));
      tx.objectStore(STORE).put(deck, storeKey(userId, deck.id));
    });
  } finally {
    db.close();
  }
}

export async function idbGetDeck(userId: string, deckId: string): Promise<StoredDeck | undefined> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(storeKey(userId, deckId));
      r.onsuccess = () => resolve(r.result as StoredDeck | undefined);
      r.onerror = () => reject(r.error ?? new Error("idb read"));
    });
  } finally {
    db.close();
  }
}

export async function idbDeleteDeck(userId: string, deckId: string): Promise<void> {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("idb delete"));
      tx.objectStore(STORE).delete(storeKey(userId, deckId));
    });
  } finally {
    db.close();
  }
}

function readDeckIdList(userId: string): string[] {
  try {
    const raw = localStorage.getItem(DEMO_KEYS.deckIdsForUser(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeDeckIdList(userId: string, ids: string[]) {
  localStorage.setItem(DEMO_KEYS.deckIdsForUser(userId), JSON.stringify(ids));
}

/** Load all decks for user (IndexedDB + id list). Migrates legacy localStorage JSON if present. */
export async function loadDecksForUser(userId: string): Promise<StoredDeck[]> {
  let ids = readDeckIdList(userId);

  if (ids.length === 0) {
    const legacyRaw = localStorage.getItem(DEMO_KEYS.decksForUser(userId));
    if (legacyRaw) {
      try {
        const legacy = JSON.parse(legacyRaw) as StoredDeck[];
        if (Array.isArray(legacy) && legacy.length > 0) {
          const nextIds: string[] = [];
          for (const d of legacy) {
            if (!d?.id) continue;
            await idbPutDeck(userId, sanitizeStoredDeck(d));
            nextIds.push(d.id);
          }
          ids = nextIds;
          writeDeckIdList(userId, ids);
          localStorage.removeItem(DEMO_KEYS.decksForUser(userId));
        }
      } catch (e) {
        console.error("Deck migration failed:", e);
      }
    }
  }

  const decks: StoredDeck[] = [];
  for (const id of ids) {
    const raw = await idbGetDeck(userId, id);
    if (raw) decks.push(sanitizeStoredDeck(raw));
  }
  return decks;
}

export async function persistDecksForUser(userId: string, decks: StoredDeck[]): Promise<void> {
  const previous = readDeckIdList(userId);
  const ids = decks.map((d) => d.id);
  const keep = new Set(ids);
  for (const id of previous) {
    if (!keep.has(id)) await idbDeleteDeck(userId, id);
  }
  for (const d of decks) {
    await idbPutDeck(userId, sanitizeStoredDeck(d));
  }
  writeDeckIdList(userId, ids);
}
