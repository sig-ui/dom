// @ts-check

/**
 * SigUI DOM animate module for elements.
 * @module
 */
/**
 * resolveElements.
 * @param {*} target
 * @returns {*}
 */
export function resolveElements(target) {
  if (typeof target === "string") {
    return Array.from(document.querySelectorAll(target));
  }
  if (typeof NodeList !== "undefined" && target instanceof NodeList) {
    return Array.from(target);
  }
  if (typeof target.length === "number" && typeof target.item === "function") {
    return Array.from(target);
  }
  return [target];
}
