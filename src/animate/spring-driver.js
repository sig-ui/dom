// @ts-nocheck

/**
 * SigUI DOM animate module for spring driver.
 * @module
 */
import { getSpringPresets, springToLinear, computeSpringDuration } from "@sig-ui/core/motion";
import { readDurationScalar } from "./resolve.js";
import { applyTransformStyles } from "./apply-styles.js";
const MAX_DT_MS = 64;
const POSITION_THRESHOLD = 0.001;
const VELOCITY_THRESHOLD = 0.01;
/**
 * stepSpring.
 * @param {*} state
 * @param {*} config
 * @param {*} dt
 * @returns {*}
 */
export function stepSpring(state, config, dt) {
  const { stiffness, damping, mass } = config;
  const { position, velocity, target } = state;
  const force = -stiffness * (position - target) - damping * velocity;
  const acceleration = force / mass;
  const newVelocity = velocity + acceleration * dt;
  const newPosition = position + newVelocity * dt;
  return {
    position: newPosition,
    velocity: newVelocity,
    target
  };
}
/**
 * isSettled.
 * @param {*} state
 * @returns {*}
 */
export function isSettled(state) {
  return Math.abs(state.position - state.target) < POSITION_THRESHOLD && Math.abs(state.velocity) < VELOCITY_THRESHOLD;
}
function resolveSpringConfig(spring) {
  if (spring === undefined) {
    return getSpringPresets().default;
  }
  if (typeof spring === "string") {
    const presets = getSpringPresets();
    return presets[spring] ?? presets.default;
  }
  return spring;
}
function parseNumericValue(value) {
  if (typeof value === "number")
    return value;
  if (typeof value === "string")
    return parseFloat(value) || 0;
  const to = value[1];
  return typeof to === "number" ? to : parseFloat(to) || 0;
}
function parseFromValue(value) {
  if (Array.isArray(value)) {
    const from = value[0];
    return typeof from === "number" ? from : parseFloat(from) || 0;
  }
  return 0;
}
/**
 * spring.
 * @param {*} target
 * @param {*} keyframes
 * @param {*} options
 * @returns {*}
 */
export function spring(target, keyframes, options) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) {
    const noop = Promise.resolve();
    return {
      stop() {},
      setTarget() {},
      finished: noop
    };
  }
  const config = resolveSpringConfig(options?.spring);
  const applyScalar = options?.respectDurationScalar !== false;
  if (applyScalar) {
    const scalar = readDurationScalar(el);
    if (scalar < 0.1) {
      return springFallback(el, keyframes, config);
    }
  }
  const states = new Map;
  const initialVelocities = options?.velocity ?? {};
  for (const [prop, value] of Object.entries(keyframes)) {
    states.set(prop, {
      position: parseFromValue(value),
      velocity: initialVelocities[prop] ?? 0,
      target: parseNumericValue(value)
    });
  }
  let rafId = null;
  let lastTime = null;
  let stopped = false;
  let resolveFinished;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
  });
  function applyStyles() {
    const entries = [];
    for (const [prop, state] of states) {
      entries.push([prop, state.position]);
    }
    applyTransformStyles(el, entries);
  }
  function tick(now) {
    if (stopped)
      return;
    if (lastTime === null) {
      lastTime = now;
      applyStyles();
      rafId = requestAnimationFrame(tick);
      return;
    }
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > MAX_DT_MS / 1000) {
      dt = MAX_DT_MS / 1000;
    }
    let allSettled = true;
    for (const [prop, state] of states) {
      const updated = stepSpring(state, config, dt);
      states.set(prop, updated);
      if (!isSettled(updated)) {
        allSettled = false;
      }
    }
    applyStyles();
    if (allSettled) {
      for (const [prop, state] of states) {
        states.set(prop, { ...state, position: state.target, velocity: 0 });
      }
      applyStyles();
      resolveFinished();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);
  return {
    stop() {
      stopped = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resolveFinished();
    },
    setTarget(newKeyframes) {
      for (const [prop, value] of Object.entries(newKeyframes)) {
        const existing = states.get(prop);
        states.set(prop, {
          position: existing?.position ?? 0,
          velocity: existing?.velocity ?? 0,
          target: parseNumericValue(value)
        });
      }
    },
    finished
  };
}
function springFallback(el, keyframes, config) {
  const easing = springToLinear(config);
  const duration = Math.max(computeSpringDuration(config) * readDurationScalar(el), 1);
  const waapiKeyframes = [];
  const from = {};
  const to = {};
  for (const [prop, value] of Object.entries(keyframes)) {
    const fromVal = parseFromValue(value);
    const toVal = parseNumericValue(value);
    if (prop === "x" || prop === "translateX") {
      from.transform = `translateX(${fromVal}px)`;
      to.transform = `translateX(${toVal}px)`;
    } else if (prop === "y" || prop === "translateY") {
      from.transform = `translateY(${fromVal}px)`;
      to.transform = `translateY(${toVal}px)`;
    } else if (prop === "scale") {
      from.transform = `scale(${fromVal})`;
      to.transform = `scale(${toVal})`;
    } else if (prop === "rotate") {
      from.transform = `rotate(${fromVal}deg)`;
      to.transform = `rotate(${toVal}deg)`;
    } else {
      from[prop] = fromVal;
      to[prop] = toVal;
    }
  }
  waapiKeyframes.push(from, to);
  const anim = el.animate(waapiKeyframes, {
    duration,
    easing,
    fill: "forwards"
  });
  let resolveFinished;
  const finished = new Promise((resolve) => {
    resolveFinished = resolve;
    anim.finished.then(() => resolve());
  });
  return {
    stop() {
      anim.cancel();
      resolveFinished();
    },
    setTarget() {},
    finished
  };
}
