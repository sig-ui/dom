// @ts-check

/**
 * SigUI DOM animate module for gesture.
 * @module
 */
import {
  computeVelocity,
  detectSwipe,
  applyDragConstraint,
  elasticDisplacement
} from "@sig-ui/core/motion";
import { applyTransformStyles } from "./apply-styles.js";
import { spring } from "./spring-driver.js";
import { readDurationScalar } from "./resolve.js";
/**
 * drag.
 * @param {*} element
 * @param {*} options
 * @returns {*}
 */
export function drag(element, options) {
  const el = typeof element === "string" ? document.querySelector(element) : element;
  if (!el)
    return () => {};
  const htmlEl = el;
  const axis = options?.axis;
  const bounds = options?.bounds;
  const useElastic = options?.elastic !== false;
  const elasticMax = options?.elasticMax ?? 100;
  const settleSpring = options?.settleSpring ?? "default";
  const originalTouchAction = htmlEl.style.touchAction;
  if (axis === "x") {
    htmlEl.style.touchAction = "pan-y";
  } else if (axis === "y") {
    htmlEl.style.touchAction = "pan-x";
  } else {
    htmlEl.style.touchAction = "none";
  }
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;
  let samples = [];
  let activeSpring = null;
  function onPointerDown(e) {
    if (activeSpring) {
      activeSpring.stop();
      activeSpring = null;
    }
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    samples = [{ point: { x: e.clientX, y: e.clientY }, time: e.timeStamp }];
    htmlEl.setPointerCapture(e.pointerId);
    const state = { x: currentX, y: currentY, dx: 0, dy: 0, clientX: e.clientX, clientY: e.clientY };
    options?.onDragStart?.(state);
  }
  function onPointerMove(e) {
    if (!isDragging)
      return;
    let rawX = e.clientX - startX;
    let rawY = e.clientY - startY;
    if (axis === "x")
      rawY = 0;
    if (axis === "y")
      rawX = 0;
    let x = rawX;
    let y = rawY;
    if (bounds) {
      if (useElastic) {
        if (bounds.min) {
          if (x < bounds.min.x)
            x = bounds.min.x + elasticDisplacement(x - bounds.min.x, elasticMax);
          if (y < bounds.min.y)
            y = bounds.min.y + elasticDisplacement(y - bounds.min.y, elasticMax);
        }
        if (bounds.max) {
          if (x > bounds.max.x)
            x = bounds.max.x + elasticDisplacement(x - bounds.max.x, elasticMax);
          if (y > bounds.max.y)
            y = bounds.max.y + elasticDisplacement(y - bounds.max.y, elasticMax);
        }
      } else {
        const constrained = applyDragConstraint({ x, y }, { min: bounds.min, max: bounds.max });
        x = constrained.x;
        y = constrained.y;
      }
    }
    currentX = x;
    currentY = y;
    if (options?.transform !== false) {
      const entries = [];
      if (axis !== "y")
        entries.push(["x", currentX]);
      if (axis !== "x")
        entries.push(["y", currentY]);
      applyTransformStyles(htmlEl, entries);
    }
    samples.push({ point: { x: e.clientX, y: e.clientY }, time: e.timeStamp });
    if (samples.length > 20)
      samples = samples.slice(-20);
    const state = {
      x: currentX,
      y: currentY,
      dx: e.clientX - startX - currentX,
      dy: e.clientY - startY - currentY,
      clientX: e.clientX,
      clientY: e.clientY
    };
    options?.onDrag?.(state);
  }
  function onPointerUp(e) {
    if (!isDragging)
      return;
    isDragging = false;
    htmlEl.releasePointerCapture(e.pointerId);
    const velocity = computeVelocity(samples, e.timeStamp);
    const endState = {
      x: currentX,
      y: currentY,
      dx: 0,
      dy: 0,
      clientX: e.clientX,
      clientY: e.clientY,
      velocityX: velocity.x,
      velocityY: velocity.y
    };
    options?.onDragEnd?.(endState);
    const scalar = readDurationScalar(el);
    const isReduced = scalar < 0.1;
    let targetX = currentX;
    let targetY = currentY;
    let needsSettle = false;
    if (bounds) {
      if (bounds.min) {
        if (targetX < bounds.min.x) {
          targetX = bounds.min.x;
          needsSettle = true;
        }
        if (targetY < bounds.min.y) {
          targetY = bounds.min.y;
          needsSettle = true;
        }
      }
      if (bounds.max) {
        if (targetX > bounds.max.x) {
          targetX = bounds.max.x;
          needsSettle = true;
        }
        if (targetY > bounds.max.y) {
          targetY = bounds.max.y;
          needsSettle = true;
        }
      }
    }
    if (needsSettle && options?.transform !== false) {
      const keyframes = {};
      if (axis !== "y")
        keyframes.x = [currentX, targetX];
      if (axis !== "x")
        keyframes.y = [currentY, targetY];
      activeSpring = spring(el, keyframes, {
        spring: isReduced ? "snappy" : settleSpring,
        respectDurationScalar: true
      });
      activeSpring.finished.then(() => {
        currentX = targetX;
        currentY = targetY;
        activeSpring = null;
      });
    }
  }
  htmlEl.addEventListener("pointerdown", onPointerDown);
  htmlEl.addEventListener("pointermove", onPointerMove);
  htmlEl.addEventListener("pointerup", onPointerUp);
  htmlEl.addEventListener("pointercancel", onPointerUp);
  return () => {
    htmlEl.removeEventListener("pointerdown", onPointerDown);
    htmlEl.removeEventListener("pointermove", onPointerMove);
    htmlEl.removeEventListener("pointerup", onPointerUp);
    htmlEl.removeEventListener("pointercancel", onPointerUp);
    htmlEl.style.touchAction = originalTouchAction;
    if (activeSpring) {
      activeSpring.stop();
      activeSpring = null;
    }
  };
}
/**
 * swipe.
 * @param {*} element
 * @param {*} options
 * @returns {*}
 */
export function swipe(element, options) {
  const el = typeof element === "string" ? document.querySelector(element) : element;
  if (!el)
    return () => {};
  const htmlEl = el;
  const allowedDirs = options.direction ? Array.isArray(options.direction) ? options.direction : [options.direction] : null;
  let startPoint = null;
  let samples = [];
  function onPointerDown(e) {
    startPoint = { x: e.clientX, y: e.clientY };
    samples = [{ point: { x: e.clientX, y: e.clientY }, time: e.timeStamp }];
    htmlEl.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!startPoint)
      return;
    samples.push({ point: { x: e.clientX, y: e.clientY }, time: e.timeStamp });
    if (samples.length > 20)
      samples = samples.slice(-20);
  }
  function onPointerUp(e) {
    if (!startPoint)
      return;
    htmlEl.releasePointerCapture(e.pointerId);
    const velocity = computeVelocity(samples, e.timeStamp);
    const displacement = {
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y
    };
    const dir = detectSwipe(velocity, displacement, {
      velocityThreshold: options.velocityThreshold,
      displacementThreshold: options.displacementThreshold
    });
    if (dir && (!allowedDirs || allowedDirs.includes(dir))) {
      options.onSwipe(dir, velocity);
    }
    startPoint = null;
    samples = [];
  }
  htmlEl.addEventListener("pointerdown", onPointerDown);
  htmlEl.addEventListener("pointermove", onPointerMove);
  htmlEl.addEventListener("pointerup", onPointerUp);
  htmlEl.addEventListener("pointercancel", onPointerUp);
  return () => {
    htmlEl.removeEventListener("pointerdown", onPointerDown);
    htmlEl.removeEventListener("pointermove", onPointerMove);
    htmlEl.removeEventListener("pointerup", onPointerUp);
    htmlEl.removeEventListener("pointercancel", onPointerUp);
  };
}
