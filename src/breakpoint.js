// @ts-check

/**
 * SigUI DOM breakpoint module for breakpoint.
 * @module
 */
import { BREAKPOINT_VALUES, BREAKPOINT_ORDER, resolveBreakpoint } from "@sig-ui/core";
/**
 * watchBreakpoint.
 * @param {*} callback
 * @param {*} options
 * @returns {*}
 */
export function watchBreakpoint(callback, options) {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") {
    return () => {};
  }
  const immediate = options?.immediate ?? true;
  let current = getCurrentBreakpoint();
  if (immediate) {
    callback(current);
  }
  const listeners = [];
  for (const name of BREAKPOINT_ORDER) {
    const value = BREAKPOINT_VALUES[name];
    const mql = matchMedia(`(min-width: ${value}px)`);
    const handler = () => {
      const next = getCurrentBreakpoint();
      if (next !== current) {
        current = next;
        callback(current);
      }
    };
    mql.addEventListener("change", handler);
    listeners.push({ mql, handler });
  }
  return () => {
    for (const { mql, handler } of listeners) {
      mql.removeEventListener("change", handler);
    }
  };
}
/**
 * getCurrentBreakpoint.
 * @returns {*}
 */
export function getCurrentBreakpoint() {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") {
    return null;
  }
  for (let i = BREAKPOINT_ORDER.length - 1;i >= 0; i--) {
    const name = BREAKPOINT_ORDER[i];
    const value = BREAKPOINT_VALUES[name];
    if (matchMedia(`(min-width: ${value}px)`).matches) {
      return name;
    }
  }
  return null;
}
