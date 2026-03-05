// @ts-check

/**
 * SigUI DOM spacing module for base unit.
 * @module
 */
const _baseUnitCache = new WeakMap;
/**
 * readBaseUnit.
 * @param {*} element
 * @returns {*}
 */
export function readBaseUnit(element) {
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const frame = Math.floor(now / 16);
  const el = typeof document !== "undefined" ? element ?? document.documentElement : null;
  if (el) {
    const cached = _baseUnitCache.get(el);
    if (cached && cached.frame === frame) {
      return cached.value;
    }
  }
  let value = 4;
  if (el) {
    const raw = getComputedStyle(el).getPropertyValue("--sg-base-unit").trim();
    if (raw) {
      if (raw.endsWith("rem")) {
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed))
          value = parsed * 16;
      } else {
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed))
          value = raw.endsWith("px") ? parsed : parsed;
      }
    }
    _baseUnitCache.set(el, { value, frame });
  }
  return value;
}
