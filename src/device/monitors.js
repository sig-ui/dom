// @ts-check

/**
 * SigUI DOM device module for monitors.
 * @module
 */
/**
 * watchDPR.
 * @param {*} callback
 * @returns {*}
 */
export function watchDPR(callback) {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") {
    return () => {};
  }
  let currentDpr = window.devicePixelRatio ?? 1;
  let mql = null;
  let handler = null;
  let disposed = false;
  const watch = () => {
    if (disposed)
      return;
    if (mql && handler) {
      mql.removeEventListener("change", handler);
    }
    mql = matchMedia(`(resolution: ${currentDpr}dppx)`);
    handler = () => {
      if (disposed)
        return;
      currentDpr = window.devicePixelRatio ?? 1;
      callback(currentDpr);
      watch();
    };
    mql.addEventListener("change", handler);
  };
  watch();
  return () => {
    disposed = true;
    if (mql && handler) {
      mql.removeEventListener("change", handler);
    }
  };
}
