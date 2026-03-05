// @ts-check

/**
 * SigUI DOM adaptive system module for adaptive system.
 * @module
 */
import { DEFAULT_DEVICE_CONTEXT } from "@sig-ui/core";
import { resolveTheme } from "@sig-ui/theme";
import {
  createDeviceContext,
  watchDeviceContext,
  applyAdaptiveTokens,
  removeAdaptiveTokens
} from "./device/index.js";
/**
 * setupAdaptiveSystem.
 * @param {*} options
 * @returns {*}
 */
export function setupAdaptiveSystem(options) {
  const config = options?.config;
  const element = options?.element;
  const onChange = options?.onChange;
  if (typeof window === "undefined") {
    return {
      context: DEFAULT_DEVICE_CONTEXT,
      theme: config ? resolveTheme(config) : null,
      refresh() {},
      destroy() {}
    };
  }
  let currentContext = createDeviceContext();
  let currentTheme = config ? resolveTheme(config, currentContext) : null;
  let destroyed = false;
  applyAdaptiveTokens(currentContext, element);
  const applyUpdate = (ctx) => {
    if (destroyed)
      return;
    currentContext = ctx;
    currentTheme = config ? resolveTheme(config, ctx) : null;
    applyAdaptiveTokens(ctx, element);
    onChange?.(ctx, currentTheme);
  };
  const stopWatching = watchDeviceContext(applyUpdate, options?.watchOptions);
  const handle = {
    get context() {
      return currentContext;
    },
    get theme() {
      return currentTheme;
    },
    refresh() {
      if (destroyed)
        return;
      applyUpdate(createDeviceContext());
    },
    destroy() {
      if (destroyed)
        return;
      destroyed = true;
      stopWatching();
      removeAdaptiveTokens(element);
    }
  };
  return handle;
}
