// @ts-check

/**
 * SigUI DOM index module for index.
 * @module
 */
export { ColorManager } from "./color-manager.js";
export { ColorCache } from "./cache.js";
export { watchDarkMode } from "./dark-mode.js";
export { resolveColor } from "./resolver.js";
export { injectCSS, removeCSS, generateCSSDeclarations } from "./css-inject.js";
export {
  getCategoricalPalette,
  getSequentialScale,
  getDivergingScale
} from "./data-viz.js";
export {
  applyBrandColor,
  removeBrandColor,
  generateBrandCSS
} from "./brand-runtime.js";
export { resolveRole } from "./resolver.js";
export { watchBreakpoint, getCurrentBreakpoint } from "./breakpoint.js";
export { setupAdaptiveSystem } from "./adaptive-system.js";
export {
  collectClassificationSignals,
  collectDisplaySignals,
  collectAmbientSignals,
  collectRefreshRate,
  collectColorDepth,
  collectOrientation,
  detectTier,
  createDeviceContext,
  watchDeviceContext,
  applyAdaptiveTokens,
  removeAdaptiveTokens,
  watchDPR
} from "./device/index.js";
