// @ts-check

/**
 * SigUI DOM dark mode module for dark mode.
 * @module
 */
/**
 * watchDarkMode.
 * @param {*} callback
 * @returns {*}
 */
export function watchDarkMode(callback) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return () => {};
  }
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e) => callback(e.matches);
  callback(mql.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}
