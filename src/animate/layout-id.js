// @ts-check

/**
 * SigUI DOM animate module for layout id.
 * @module
 */
import { flipSnapshot } from "./flip.js";
/**
 * createLayoutIdRegistry.
 * @returns {*}
 */
export function createLayoutIdRegistry() {
  const elements = new Map;
  const snapshots = new Map;
  return {
    register(id, element) {
      const existing = elements.get(id);
      if (existing) {
        snapshots.set(id, flipSnapshot(existing));
      }
      elements.set(id, element);
    },
    unregister(id) {
      const el = elements.get(id);
      let snapshot;
      if (el) {
        snapshot = flipSnapshot(el);
        snapshots.set(id, snapshot);
      } else {
        snapshot = snapshots.get(id);
      }
      elements.delete(id);
      return snapshot;
    },
    get(id) {
      return elements.get(id);
    }
  };
}
