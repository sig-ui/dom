// @ts-check

/**
 * SigUI DOM animate module for animate.
 * @module
 */
import {
  resolveDuration,
  resolveEasing,
  expandKeyframes,
  buildWaapiKeyframes
} from "./resolve.js";
import { resolveElements } from "./elements.js";
function transformIndex(index, total, from) {
  if (from === "last") {
    return total - 1 - index;
  }
  if (from === "center") {
    const center = (total - 1) / 2;
    return Math.abs(index - center);
  }
  return index;
}
/**
 * animate.
 * @param {*} target
 * @param {*} keyframes
 * @param {*} options
 * @returns {*}
 */
export function animate(target, keyframes, options) {
  const elements = resolveElements(target);
  const applyScalar = options?.respectDurationScalar !== false;
  const firstEl = elements[0];
  const duration = resolveDuration(options?.duration, firstEl, applyScalar);
  const easing = resolveEasing(options?.easing);
  const fill = options?.fill ?? "none";
  const iterations = options?.iterations ?? 1;
  const direction = options?.direction ?? "normal";
  const expanded = expandKeyframes(keyframes);
  const waapiKeyframes = buildWaapiKeyframes(expanded);
  const animations = [];
  for (let i = 0;i < elements.length; i++) {
    const el = elements[i];
    let delay = 0;
    if (typeof options?.delay === "function") {
      const staggerFn = options.delay;
      const transformed = transformIndex(i, elements.length, staggerFn.__staggerFrom ?? "first");
      delay = staggerFn(transformed);
    } else if (typeof options?.delay === "number") {
      delay = options.delay;
    }
    const anim = el.animate(waapiKeyframes, {
      duration,
      easing,
      delay,
      fill,
      iterations,
      direction
    });
    animations.push(anim);
  }
  const finished = Promise.all(animations.map((a) => a.finished)).then(() => {});
  const controls = {
    play() {
      for (const a of animations)
        a.play();
    },
    pause() {
      for (const a of animations)
        a.pause();
    },
    cancel() {
      for (const a of animations)
        a.cancel();
    },
    finish() {
      for (const a of animations)
        a.finish();
    },
    reverse() {
      for (const a of animations)
        a.reverse();
    },
    get playbackRate() {
      return animations[0]?.playbackRate ?? 1;
    },
    set playbackRate(rate) {
      for (const a of animations)
        a.playbackRate = rate;
    },
    finished,
    animations
  };
  return controls;
}
/**
 * wrapAnimations.
 * @param {*} animations
 * @returns {*}
 */
export function wrapAnimations(animations) {
  const finished = animations.length > 0 ? Promise.all(animations.map((a) => a.finished)).then(() => {}) : Promise.resolve();
  return {
    play() {
      for (const a of animations)
        a.play();
    },
    pause() {
      for (const a of animations)
        a.pause();
    },
    cancel() {
      for (const a of animations)
        a.cancel();
    },
    finish() {
      for (const a of animations)
        a.finish();
    },
    reverse() {
      for (const a of animations)
        a.reverse();
    },
    get playbackRate() {
      return animations[0]?.playbackRate ?? 1;
    },
    set playbackRate(rate) {
      for (const a of animations)
        a.playbackRate = rate;
    },
    finished,
    animations
  };
}
