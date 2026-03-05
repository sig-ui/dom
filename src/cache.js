// @ts-check

/**
 * SigUI DOM cache module for cache.
 * @module
 */
const IDB_NAME = "sg-cache";
const IDB_VERSION = 1;
const IDB_STORE = "themes";

export class ColorCache {
  l1 = new Map;
  persistent;
  storage;
  idbReady = null;
  constructor(options = {}) {
    this.persistent = options.persistent ?? true;
    this.storage = options.storage ?? "localstorage";
    if (this.persistent && this.storage === "indexeddb") {
      this.idbReady = this.openIDB();
    }
  }
  get(key) {
    const l1 = this.l1.get(key);
    if (l1)
      return l1;
    if (this.persistent && this.storage === "localstorage" && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored);
          this.l1.set(key, data);
          return data;
        }
      } catch {}
    }
    if (this.persistent && this.storage === "indexeddb" && this.idbReady) {
      this.loadFromIDB(key);
    }
    return null;
  }
  set(key, value) {
    this.l1.set(key, value);
    if (this.persistent && this.storage === "localstorage" && typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
    if (this.persistent && this.storage === "indexeddb" && this.idbReady) {
      this.writeToIDB(key, value);
    }
  }
  evictStale(currentKey) {
    if (this.storage === "indexeddb") {
      this.evictStaleIDB(currentKey);
      return;
    }
    if (typeof localStorage === "undefined")
      return;
    const prefix = "sg-cache-";
    const keysToRemove = [];
    for (let i = 0;i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix) && k !== currentKey) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
  }
  static cacheKey(themeName, config) {
    const hash = fnv1a(JSON.stringify(sortedConfig(config)));
    return `sg-cache-${themeName}-${hash}`;
  }
  openIDB() {
    if (typeof indexedDB === "undefined")
      return Promise.reject(new Error("IndexedDB unavailable"));
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async writeToIDB(key, value) {
    try {
      const db = await this.idbReady;
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
    } catch {}
  }
  async loadFromIDB(key) {
    try {
      const db = await this.idbReady;
      const tx = db.transaction(IDB_STORE, "readonly");
      const request = tx.objectStore(IDB_STORE).get(key);
      request.onsuccess = () => {
        if (request.result) {
          this.l1.set(key, request.result);
        }
      };
    } catch {}
  }
  async evictStaleIDB(currentKey) {
    try {
      const db = await this.idbReady;
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      const request = store.getAllKeys();
      request.onsuccess = () => {
        const keys = request.result;
        const prefix = "sg-cache-";
        for (const k of keys) {
          if (typeof k === "string" && k.startsWith(prefix) && k !== currentKey) {
            store.delete(k);
          }
        }
      };
    } catch {}
  }
}
function sortedConfig(obj) {
  if (obj === null || typeof obj !== "object")
    return obj;
  if (Array.isArray(obj))
    return obj.map(sortedConfig);
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortedConfig(obj[key]);
  }
  return sorted;
}
function fnv1a(str) {
  let hash = 2166136261;
  for (let i = 0;i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
