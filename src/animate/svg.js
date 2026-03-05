// @ts-nocheck

/**
 * SigUI DOM animate module for svg.
 * @module
 */
import { interpolatePath, cubicBezier, sampleLinearEasing } from "@sig-ui/core/motion";
import { resolveDuration, resolveEasing, resolveEasingTuple, readDurationScalar } from "./resolve.js";
import { wrapAnimations } from "./animate.js";
/**
 * drawStroke.
 * @param {*} path
 * @param {*} options
 * @returns {*}
 */
export function drawStroke(path, options) {
  const el = typeof path === "string" ? document.querySelector(path) : path;
  if (!el)
    return wrapAnimations([]);
  const applyScalar = options?.respectDurationScalar !== false;
  const duration = resolveDuration(options?.duration ?? "slow", el, applyScalar);
  const easing = resolveEasing(options?.easing ?? "default");
  const direction = options?.direction ?? "forward";
  if (applyScalar && readDurationScalar(el) < 0.1) {
    const anim = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: Math.max(duration, 1), easing, fill: "none" });
    return wrapAnimations([anim]);
  }
  const totalLength = el.getTotalLength();
  el.style.strokeDasharray = String(totalLength);
  const from = direction === "forward" ? totalLength : 0;
  const to = direction === "forward" ? 0 : totalLength;
  const anim = el.animate([
    { strokeDashoffset: from },
    { strokeDashoffset: to }
  ], { duration, easing, fill: "forwards" });
  return wrapAnimations([anim]);
}
/**
 * morphPath.
 * @param {*} element
 * @param {*} toPath
 * @param {*} options
 * @returns {*}
 */
export function morphPath(element, toPath, options) {
  const el = typeof element === "string" ? document.querySelector(element) : element;
  if (!el)
    return wrapAnimations([]);
  const applyScalar = options?.respectDurationScalar !== false;
  const duration = resolveDuration(options?.duration ?? "moderate", el, applyScalar);
  const easing = resolveEasing(options?.easing ?? "default");
  if (applyScalar && readDurationScalar(el) < 0.1) {
    el.setAttribute("d", toPath);
    return wrapAnimations([]);
  }
  const fromPath = el.getAttribute("d") ?? "";
  try {
    const anim = el.animate([
      { d: `path("${fromPath}")` },
      { d: `path("${toPath}")` }
    ], { duration, easing, fill: "forwards" });
    if (anim.playState !== "idle") {
      return wrapAnimations([anim]);
    }
    anim.cancel();
  } catch {}
  const easingTuple = resolveEasingTuple(options?.easing ?? "default");
  return morphPathRaf(el, fromPath, toPath, duration, easing, easingTuple);
}
function morphPathRaf(el, fromPath, toPath, duration, easingCss, easingTuple) {
  const isLinearCss = easingCss.startsWith("linear(");
  let startTime = null;
  let rafId = null;
  let resolveFinished;
  let cancelled = false;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
  });
  function tick(now) {
    if (cancelled)
      return;
    if (startTime === null)
      startTime = now;
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = isLinearCss ? sampleLinearEasing(easingCss, t) : cubicBezier(...easingTuple, t);
    el.setAttribute("d", interpolatePath(fromPath, toPath, easedT));
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      resolveFinished();
    }
  }
  rafId = requestAnimationFrame(tick);
  const pseudoAnim = {
    finished,
    play() {},
    pause() {},
    cancel() {
      cancelled = true;
      if (rafId !== null)
        cancelAnimationFrame(rafId);
      resolveFinished();
    },
    finish() {
      cancelled = true;
      if (rafId !== null)
        cancelAnimationFrame(rafId);
      el.setAttribute("d", toPath);
      resolveFinished();
    },
    reverse() {},
    get playbackRate() {
      return 1;
    },
    set playbackRate(_) {}
  };
  return {
    play() {
      pseudoAnim.play();
    },
    pause() {
      pseudoAnim.pause();
    },
    cancel() {
      pseudoAnim.cancel();
    },
    finish() {
      pseudoAnim.finish();
    },
    reverse() {
      pseudoAnim.reverse();
    },
    get playbackRate() {
      return pseudoAnim.playbackRate;
    },
    set playbackRate(rate) {
      pseudoAnim.playbackRate = rate;
    },
    finished,
    animations: []
  };
}
