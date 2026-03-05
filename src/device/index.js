// @ts-check

/**
 * SigUI DOM device module for index.
 * @module
 */
export {
  collectClassificationSignals,
  collectDisplaySignals,
  collectAmbientSignals,
  collectRefreshRate,
  collectColorDepth,
  collectOrientation,
  detectTier,
  createDeviceContext,
  watchDeviceContext
} from "./context.js";
export {
  applyAdaptiveTokens,
  removeAdaptiveTokens
} from "./tokens.js";
export { watchDPR } from "./monitors.js";
