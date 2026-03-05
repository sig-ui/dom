// @ts-nocheck

/**
 * SigUI DOM device module for context.
 * @module
 */
import {
  classifyDevice,
  deriveCommittedInputMode,
  estimateViewingDistance,
  estimateScreenPpi,
  classifyRefreshRate,
  inferDisplayType,
  resolveGamut,
  DEFAULT_DEVICE_CONTEXT
} from "@sig-ui/core";
/**
 * collectClassificationSignals.
 * @returns {*}
 */
export function collectClassificationSignals() {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") {
    return {
      screenWidth: 1440,
      pointerCoarse: false,
      pointerFine: true,
      maxTouchPoints: 0
    };
  }
  const signals = {
    screenWidth: window.screen?.width ?? window.innerWidth,
    pointerCoarse: matchMedia("(pointer: coarse)").matches,
    pointerFine: matchMedia("(pointer: fine)").matches,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    formFactor: navigator.userAgentData?.formFactor,
    mobile: navigator.userAgentData?.mobile
  };
  return signals;
}
/**
 * collectDisplaySignals.
 * @returns {*}
 */
export function collectDisplaySignals() {
  if (typeof matchMedia === "undefined") {
    return { dynamicRangeHigh: false, gamutP3: false, gamutRec2020: false };
  }
  return {
    dynamicRangeHigh: matchMedia("(dynamic-range: high)").matches,
    gamutP3: matchMedia("(color-gamut: p3)").matches,
    gamutRec2020: matchMedia("(color-gamut: rec2020)").matches
  };
}
/**
 * collectAmbientSignals.
 * @returns {*}
 */
export function collectAmbientSignals() {
  if (typeof matchMedia === "undefined") {
    return {
      colorScheme: "light",
      contrastPreference: "none",
      reducedMotion: false,
      reducedTransparency: false,
      forcedColors: false
    };
  }
  const contrastMore = matchMedia("(prefers-contrast: more)").matches;
  const contrastLess = matchMedia("(prefers-contrast: less)").matches;
  return {
    colorScheme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    contrastPreference: contrastMore ? "more" : contrastLess ? "less" : "none",
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    reducedTransparency: matchMedia("(prefers-reduced-transparency: reduce)").matches,
    forcedColors: matchMedia("(forced-colors: active)").matches
  };
}
/**
 * collectRefreshRate.
 * @returns {*}
 */
export function collectRefreshRate() {
  if (typeof screen !== "undefined" && "refreshRate" in screen) {
    return screen.refreshRate ?? 60;
  }
  return 60;
}
/**
 * collectColorDepth.
 * @returns {*}
 */
export function collectColorDepth() {
  if (typeof screen !== "undefined") {
    const depth = screen.colorDepth ?? 24;
    if (depth >= 48)
      return 12;
    if (depth >= 30)
      return 10;
  }
  return 8;
}
/**
 * collectOrientation.
 * @returns {*}
 */
export function collectOrientation() {
  if (typeof window !== "undefined") {
    if (window.screen?.orientation?.type) {
      return window.screen.orientation.type.startsWith("portrait") ? "portrait" : "landscape";
    }
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }
  return "landscape";
}
function computeContrastBoost(ambient) {
  if (ambient.contrastPreference === "more")
    return 1.25;
  if (ambient.contrastPreference === "less")
    return 0.85;
  return 1;
}
/**
 * detectTier.
 * @returns {*}
 */
export function detectTier() {
  if (typeof navigator === "undefined")
    return 1;
  if ("AmbientLightSensor" in globalThis)
    return 3;
  if (navigator.userAgentData)
    return 2;
  return 1;
}
/**
 * createDeviceContext.
 * @returns {*}
 */
export function createDeviceContext() {
  if (typeof window === "undefined") {
    return DEFAULT_DEVICE_CONTEXT;
  }
  const classSignals = collectClassificationSignals();
  const displaySignals = collectDisplaySignals();
  const ambientSignals = collectAmbientSignals();
  const deviceClass = classifyDevice(classSignals);
  const committed = deriveCommittedInputMode(classSignals.pointerFine, classSignals.pointerCoarse);
  const displayType = inferDisplayType(displaySignals);
  const gamut = resolveGamut(displaySignals);
  const refreshRate = collectRefreshRate();
  const refreshTier = classifyRefreshRate(refreshRate);
  const colorDepth = collectColorDepth();
  const orientation = collectOrientation();
  const tier = detectTier();
  return {
    class: deviceClass,
    viewingDistanceCm: estimateViewingDistance(deviceClass),
    screenPpi: estimateScreenPpi(deviceClass),
    input: {
      committed,
      transient: "mouse",
      maxTouchPoints: classSignals.maxTouchPoints
    },
    display: {
      dpr: window.devicePixelRatio ?? 1,
      gamut,
      hdr: displaySignals.dynamicRangeHigh,
      colorDepth,
      refreshTier,
      refreshRate,
      inferredType: displayType,
      orientation
    },
    ambient: {
      ...ambientSignals,
      contrastBoost: computeContrastBoost(ambientSignals)
    },
    tier
  };
}
/**
 * watchDeviceContext.
 * @param {*} callback
 * @param {*} options
 * @returns {*}
 */
export function watchDeviceContext(callback, options) {
  if (typeof window === "undefined" || typeof matchMedia === "undefined") {
    return () => {};
  }
  const resizeDebounce = options?.resizeDebounce ?? 200;
  const reclassifyDebounce = options?.reclassifyDebounce ?? 500;
  const notify = () => callback(createDeviceContext());
  const queries = [
    "(pointer: fine)",
    "(pointer: coarse)",
    "(prefers-color-scheme: dark)",
    "(prefers-contrast: more)",
    "(prefers-contrast: less)",
    "(prefers-reduced-motion: reduce)",
    "(prefers-reduced-transparency: reduce)",
    "(forced-colors: active)",
    "(dynamic-range: high)",
    "(color-gamut: p3)",
    "(color-gamut: rec2020)",
    "(orientation: portrait)"
  ];
  const mqListeners = [];
  for (const query of queries) {
    const mql = matchMedia(query);
    const handler = () => notify();
    mql.addEventListener("change", handler);
    mqListeners.push({ mql, handler });
  }
  let resizeTimer = null;
  const resizeHandler = () => {
    if (resizeTimer)
      clearTimeout(resizeTimer);
    resizeTimer = setTimeout(notify, reclassifyDebounce);
  };
  window.addEventListener("resize", resizeHandler, { passive: true });
  let currentDpr = window.devicePixelRatio ?? 1;
  let dprMql = null;
  let dprHandler = null;
  const watchDprChange = () => {
    if (dprMql && dprHandler) {
      dprMql.removeEventListener("change", dprHandler);
    }
    dprMql = matchMedia(`(resolution: ${currentDpr}dppx)`);
    dprHandler = () => {
      currentDpr = window.devicePixelRatio ?? 1;
      notify();
      watchDprChange();
    };
    dprMql.addEventListener("change", dprHandler);
  };
  watchDprChange();
  return () => {
    for (const { mql, handler } of mqListeners) {
      mql.removeEventListener("change", handler);
    }
    window.removeEventListener("resize", resizeHandler);
    if (resizeTimer)
      clearTimeout(resizeTimer);
    if (dprMql && dprHandler) {
      dprMql.removeEventListener("change", dprHandler);
    }
  };
}
