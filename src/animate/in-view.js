// @ts-check

/**
 * SigUI DOM animate module for in view.
 * @module
 */
import { resolveElements } from "./elements.js";
/**
 * inView.
 * @param {*} target
 * @param {*} callback
 * @param {*} options
 * @returns {*}
 */
export function inView(target, callback, options) {
  const elements = resolveElements(target);
  const exitCallbacks = new Map;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const cleanup = callback(entry);
        if (typeof cleanup === "function") {
          exitCallbacks.set(entry.target, cleanup);
        }
        if (options?.once) {
          observer.unobserve(entry.target);
        }
      } else {
        const exitFn = exitCallbacks.get(entry.target);
        if (exitFn) {
          exitFn();
          exitCallbacks.delete(entry.target);
        }
      }
    }
  }, {
    threshold: options?.threshold ?? 0,
    rootMargin: options?.rootMargin ?? "0px",
    root: options?.root ?? null
  });
  for (const el of elements) {
    observer.observe(el);
  }
  return () => {
    observer.disconnect();
    for (const exitFn of exitCallbacks.values()) {
      exitFn();
    }
    exitCallbacks.clear();
  };
}
