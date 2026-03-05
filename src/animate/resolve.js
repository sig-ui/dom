// @ts-check

/**
 * SigUI DOM animate module for resolve.
 * @module
 */
import {
  getDurationScale,
  easingToCss,
  getEasingCurves,
  getSpringPresets,
  springToLinear
} from "@sig-ui/core/motion";
const DURATION_NAMES = new Set([
  "instant",
  "faster",
  "fast",
  "normal",
  "moderate",
  "slow",
  "slower"
]);
const EASING_NAMES = new Set([
  "default",
  "in",
  "out",
  "in-out",
  "linear",
  "spring",
  "snappy"
]);
const TRANSFORM_SHORTHANDS = {
  x: "translateX",
  y: "translateY",
  scale: "scale",
  rotate: "rotate"
};
const PX_PROPERTIES = new Set(["translateX", "translateY"]);
const DEG_PROPERTIES = new Set(["rotate"]);
const _scalarCache = new WeakMap;
/**
 * readDurationScalar.
 * @param {*} element
 * @returns {*}
 */
export function readDurationScalar(element) {
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const frame = Math.floor(now / 16);
  const el = typeof document !== "undefined" ? element ?? document.documentElement : null;
  if (el) {
    const cached = _scalarCache.get(el);
    if (cached && cached.frame === frame) {
      return cached.value;
    }
  }
  let value = 1;
  if (el) {
    const raw = getComputedStyle(el).getPropertyValue("--sg-duration-scalar").trim();
    if (raw) {
      const parsed = parseFloat(raw);
      if (!Number.isNaN(parsed))
        value = parsed;
    }
    _scalarCache.set(el, { value, frame });
  }
  return value;
}
/**
 * resolveDuration.
 * @param {*} value
 * @param {*} element
 * @param {*} applyScalar
 * @returns {*}
 */
export function resolveDuration(value, element, applyScalar = true) {
  let ms;
  if (value === undefined) {
    ms = 200;
  } else if (typeof value === "number") {
    ms = value;
  } else if (DURATION_NAMES.has(value)) {
    const scale = getDurationScale();
    ms = scale[value];
  } else {
    ms = 200;
  }
  if (applyScalar) {
    ms *= readDurationScalar(element);
  }
  return ms;
}
/**
 * resolveEasing.
 * @param {*} value
 * @returns {*}
 */
export function resolveEasing(value) {
  if (value === undefined) {
    return easingToCss("default");
  }
  if (EASING_NAMES.has(value)) {
    return easingToCss(value);
  }
  if (value.startsWith("spring:")) {
    const presetName = value.slice(7);
    const presets = getSpringPresets();
    const config = presets[presetName];
    if (config) {
      return springToLinear(config);
    }
  }
  return value;
}
/**
 * expandKeyframes.
 * @param {*} keyframes
 * @returns {*}
 */
export function expandKeyframes(keyframes) {
  const transforms = {};
  const properties = {};
  for (const [key, value] of Object.entries(keyframes)) {
    if (key in TRANSFORM_SHORTHANDS) {
      transforms[TRANSFORM_SHORTHANDS[key]] = value;
    } else {
      properties[key] = value;
    }
  }
  return { transforms, properties };
}
function addUnit(prop, value) {
  if (typeof value === "string")
    return value;
  if (PX_PROPERTIES.has(prop))
    return `${value}px`;
  if (DEG_PROPERTIES.has(prop))
    return `${value}deg`;
  return String(value);
}
/**
 * buildWaapiKeyframes.
 * @param {*} expanded
 * @returns {*}
 */
export function buildWaapiKeyframes(expanded) {
  const { transforms, properties } = expanded;
  const hasTransforms = Object.keys(transforms).length > 0;
  const hasProperties = Object.keys(properties).length > 0;
  if (!hasTransforms && !hasProperties)
    return [{}];
  const from = {};
  const to = {};
  if (hasTransforms) {
    const fromParts = [];
    const toParts = [];
    for (const [fn, val] of Object.entries(transforms)) {
      if (Array.isArray(val)) {
        fromParts.push(`${fn}(${addUnit(fn, val[0])})`);
        toParts.push(`${fn}(${addUnit(fn, val[1])})`);
      } else {
        const identity = fn === "scale" ? "1" : fn === "rotate" ? "0deg" : "0px";
        fromParts.push(`${fn}(${identity})`);
        toParts.push(`${fn}(${addUnit(fn, val)})`);
      }
    }
    from.transform = fromParts.join(" ");
    to.transform = toParts.join(" ");
  }
  if (hasProperties) {
    for (const [prop, val] of Object.entries(properties)) {
      if (Array.isArray(val)) {
        from[prop] = val[0];
        to[prop] = val[1];
      } else {
        to[prop] = val;
      }
    }
  }
  const hasFromProps = Object.keys(from).length > 0;
  if (hasFromProps) {
    return [from, to];
  }
  return [to];
}
/**
 * resolveEasingTuple.
 * @param {*} value
 * @returns {*}
 */
export function resolveEasingTuple(value) {
  const curves = getEasingCurves();
  if (value === undefined) {
    return curves.default;
  }
  if (EASING_NAMES.has(value)) {
    return curves[value];
  }
  return curves.default;
}
