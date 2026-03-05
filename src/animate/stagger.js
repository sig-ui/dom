// @ts-check

/**
 * SigUI DOM animate module for stagger.
 * @module
 */
import { computeStaggerDelay, computeEasedStaggerDelay } from "@sig-ui/core/motion";
/**
 * stagger.
 * @param {*} delayMs
 * @param {*} options
 * @returns {*}
 */
export function stagger(delayMs = 50, options) {
  const from = options?.from ?? "first";
  const maxItems = options?.maxItems ?? 10;
  const fn = (index) => {
    return computeStaggerDelay(index, delayMs, maxItems);
  };
  fn.__staggerFrom = from;
  fn.__staggerMaxItems = maxItems;
  return fn;
}
/**
 * staggerEased.
 * @param {*} totalMs
 * @param {*} total
 * @param {*} options
 * @returns {*}
 */
export function staggerEased(totalMs, total, options) {
  const from = options?.from ?? "first";
  const easing = options?.easing ?? "out";
  const maxItems = options?.maxItems ?? 1 / 0;
  const effectiveTotal = Math.min(total, maxItems);
  const fn = (index) => {
    const capped = Math.min(index, effectiveTotal - 1);
    return computeEasedStaggerDelay(capped, effectiveTotal, totalMs, easing);
  };
  fn.__staggerFrom = from;
  fn.__staggerMaxItems = maxItems === 1 / 0 ? total : maxItems;
  return fn;
}
