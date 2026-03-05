// @ts-check

/**
 * Repository module for cache.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { ColorCache } from "../src/cache.js";
describe("ColorCache", () => {
  test("generates deterministic cache keys", () => {
    const config = {
      palette: { brand: "#6366f1" },
      backgrounds: { light: "#ffffff", dark: "#000000" }
    };
    const key1 = ColorCache.cacheKey("test", config);
    const key2 = ColorCache.cacheKey("test", config);
    expect(key1).toBe(key2);
  });
  test("different configs produce different keys", () => {
    const config1 = {
      palette: { brand: "#6366f1" },
      backgrounds: { light: "#ffffff", dark: "#000000" }
    };
    const config2 = {
      palette: { brand: "#ff0000" },
      backgrounds: { light: "#ffffff", dark: "#000000" }
    };
    const key1 = ColorCache.cacheKey("test", config1);
    const key2 = ColorCache.cacheKey("test", config2);
    expect(key1).not.toBe(key2);
  });
  test("L1 cache works", () => {
    const cache = new ColorCache({ persistent: false });
    const data = { test: {} };
    cache.set("key1", data);
    expect(cache.get("key1")).toBe(data);
  });
  test("cache miss returns null", () => {
    const cache = new ColorCache({ persistent: false });
    expect(cache.get("nonexistent")).toBeNull();
  });
  test("IndexedDB cache stores to L1 on set", () => {
    const cache = new ColorCache({ persistent: true, storage: "indexeddb" });
    const data = { test: {} };
    cache.set("idb-key", data);
    expect(cache.get("idb-key")).toBe(data);
  });
  test("IndexedDB cache returns null on miss", () => {
    const cache = new ColorCache({ persistent: true, storage: "indexeddb" });
    expect(cache.get("nonexistent-idb")).toBeNull();
  });
  test("localStorage cache returns null when persistent is false", () => {
    const cache = new ColorCache({ persistent: false, storage: "localstorage" });
    expect(cache.get("missing")).toBeNull();
  });
});
