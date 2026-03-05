// @ts-check

/**
 * SigUI DOM animate module for flip.
 * @module
 */
import { computeFlipInversion } from "@sig-ui/core/motion";
import { resolveDuration, resolveEasing, readDurationScalar } from "./resolve.js";
import { resolveElements } from "./elements.js";
import { wrapAnimations } from "./animate.js";
/**
 * flipSnapshot.
 * @param {*} element
 * @returns {*}
 */
export function flipSnapshot(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}
/**
 * flipAnimate.
 * @param {*} element
 * @param {*} first
 * @param {*} options
 * @returns {*}
 */
export function flipAnimate(element, first, options) {
  const applyScalar = options?.respectDurationScalar !== false;
  if (applyScalar) {
    const scalar = readDurationScalar(element);
    if (scalar < 0.1) {
      return wrapAnimations([]);
    }
  }
  const last = flipSnapshot(element);
  const inversion = computeFlipInversion(first, last);
  if (inversion.isIdentity) {
    return wrapAnimations([]);
  }
  const duration = resolveDuration(options?.duration ?? "moderate", element, applyScalar);
  const easing = resolveEasing(options?.easing ?? "default");
  const animateSize = options?.animateSize !== false;
  const fromTransform = buildTransform(inversion.x, inversion.y, animateSize ? inversion.scaleX : 1, animateSize ? inversion.scaleY : 1);
  const toTransform = buildTransform(0, 0, 1, 1);
  const anim = element.animate([
    { transform: fromTransform },
    { transform: toTransform }
  ], { duration, easing, fill: "none" });
  return wrapAnimations([anim]);
}
/**
 * flip.
 * @param {*} elements
 * @param {*} mutation
 * @param {*} options
 * @returns {*}
 */
export function flip(elements, mutation, options) {
  const targets = Array.isArray(elements) ? elements : resolveElements(elements);
  const snapshots = targets.map((el) => flipSnapshot(el));
  mutation();
  const animations = [];
  const applyScalar = options?.respectDurationScalar !== false;
  const isReduced = applyScalar && readDurationScalar(targets[0]) < 0.1;
  if (!isReduced) {
    for (let i = 0;i < targets.length; i++) {
      const el = targets[i];
      const first = snapshots[i];
      const last = flipSnapshot(el);
      const inversion = computeFlipInversion(first, last);
      if (inversion.isIdentity)
        continue;
      const duration = resolveDuration(options?.duration ?? "moderate", el, applyScalar);
      const easing = resolveEasing(options?.easing ?? "default");
      const animateSize = options?.animateSize !== false;
      const fromTransform = buildTransform(inversion.x, inversion.y, animateSize ? inversion.scaleX : 1, animateSize ? inversion.scaleY : 1);
      const toTransform = buildTransform(0, 0, 1, 1);
      const anim = el.animate([{ transform: fromTransform }, { transform: toTransform }], { duration, easing, fill: "none" });
      animations.push(anim);
    }
  }
  return wrapAnimations(animations);
}
function buildTransform(x, y, scaleX, scaleY) {
  return `translateX(${x}px) translateY(${y}px) scaleX(${scaleX}) scaleY(${scaleY})`;
}
