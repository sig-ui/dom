// @ts-check

/**
 * SigUI DOM device module for tokens.
 * @module
 */
import { getDeviceParameters } from "@sig-ui/core";
const DATA_ATTRS = [
  "data-device",
  "data-input",
  "data-gamut",
  "data-display",
  "data-refresh",
  "data-scheme",
  "data-contrast"
];
const CSS_PROPS = [
  "--sg-adaptive-base-size",
  "--sg-adaptive-density",
  "--sg-adaptive-target-min",
  "--sg-adaptive-min-animation",
  "--sg-adaptive-contrast-boost",
  "--sg-adaptive-weight-offset"
];
/**
 * applyAdaptiveTokens.
 * @param {*} context
 * @param {*} element
 * @returns {*}
 */
export function applyAdaptiveTokens(context, element) {
  const el = element ?? (typeof document !== "undefined" ? document.documentElement : null);
  if (!el)
    return;
  const params = getDeviceParameters(context.class);
  el.setAttribute("data-device", context.class);
  el.setAttribute("data-input", context.input.committed);
  el.setAttribute("data-gamut", context.display.gamut);
  el.setAttribute("data-display", context.display.inferredType);
  el.setAttribute("data-refresh", context.display.refreshTier);
  el.setAttribute("data-scheme", context.ambient.colorScheme);
  el.setAttribute("data-contrast", context.ambient.contrastPreference);
  el.style.setProperty("--sg-adaptive-base-size", `${params.baseFontSize / 16}rem`);
  el.style.setProperty("--sg-adaptive-density", String(context.input.committed === "touch" ? 1 : context.input.committed === "pointer" ? 0.75 : 0.875));
  el.style.setProperty("--sg-adaptive-target-min", `${params.minInteractiveTarget}px`);
  el.style.setProperty("--sg-adaptive-min-animation", `${context.display.refreshTier === "high" ? 44 : context.display.refreshTier === "medium" ? 67 : 133}ms`);
  el.style.setProperty("--sg-adaptive-contrast-boost", String(context.ambient.contrastBoost));
  el.style.setProperty("--sg-adaptive-weight-offset", String(context.display.inferredType === "oled" ? -50 : -100));
  if (context.class === "tv") {
    el.style.setProperty("--sg-base-unit", "0.5rem");
  } else if (context.class === "watch") {
    el.style.setProperty("--sg-base-unit", "0.1875rem");
  }
}
/**
 * removeAdaptiveTokens.
 * @param {*} element
 * @returns {*}
 */
export function removeAdaptiveTokens(element) {
  const el = element ?? (typeof document !== "undefined" ? document.documentElement : null);
  if (!el)
    return;
  for (const attr of DATA_ATTRS) {
    el.removeAttribute(attr);
  }
  for (const prop of CSS_PROPS) {
    el.style.removeProperty(prop);
  }
  el.style.removeProperty("--sg-base-unit");
}
