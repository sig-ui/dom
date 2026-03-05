// @ts-check

/**
 * SigUI DOM brand runtime module for brand runtime.
 * @module
 */
import {
  generateFullPalette,
  fromOklch,
  toOklch,
  isInGamut,
  clampToGamut,
  deriveBrandBackground,
  ALL_STOPS
} from "@sig-ui/core";
const STYLE_ID = "sg-brand-runtime";
function toSrgbHex(color) {
  const srgb = isInGamut(color, "srgb") ? color : clampToGamut(color, "srgb");
  return fromOklch(srgb, "hex");
}
/**
 * generateBrandCSS.
 * @param {*} hex
 * @param {*} options
 * @returns {*}
 */
export function generateBrandCSS(hex, options = {}) {
  const brandOklch = toOklch(hex);
  const background = options.background ?? deriveBrandBackground(brandOklch.h, brandOklch.c, "light");
  const darkBackground = options.darkBackground ?? deriveBrandBackground(brandOklch.h, brandOklch.c, "dark");
  const tintStrength = options.tintStrength ?? 0.1;
  const harmony = options.harmony ?? "triadic";
  const lightTheme = generateFullPalette(hex, {
    harmony,
    mode: "light",
    background,
    tintStrength
  });
  const darkTheme = generateFullPalette(hex, {
    harmony,
    mode: "dark",
    background: darkBackground,
    tintStrength
  });
  const lightHexLines = [];
  const lightOklchLines = [];
  const darkHexLines = [];
  const darkOklchLines = [];
  const paletteVarMap = {
    primary: "brand",
    secondary: "secondary",
    tertiary: "tertiary",
    accent: "accent",
    neutral: "neutral",
    success: "success",
    warning: "warning",
    danger: "danger",
    info: "info"
  };
  for (const [paletteName, varPrefix] of Object.entries(paletteVarMap)) {
    const lightRamp = lightTheme.palettes[paletteName]?.ramp;
    const darkRamp = darkTheme.palettes[paletteName]?.ramp;
    if (lightRamp) {
      for (const stop of ALL_STOPS) {
        const c = lightRamp[stop];
        if (!c)
          continue;
        lightHexLines.push(`  --${varPrefix}-${stop}: ${toSrgbHex(c)};`);
        lightOklchLines.push(`  --${varPrefix}-${stop}: ${fromOklch(c, "oklch")};`);
      }
    }
    if (darkRamp) {
      for (const stop of ALL_STOPS) {
        const c = darkRamp[stop];
        if (!c)
          continue;
        darkHexLines.push(`  --${varPrefix}-${stop}: ${toSrgbHex(c)};`);
        darkOklchLines.push(`  --${varPrefix}-${stop}: ${fromOklch(c, "oklch")};`);
      }
    }
  }
  const lightSurfaceLines = [
    `  --surface-bg-lowest: ${lightTheme.surfaces["bg.lowest"]};`,
    `  --surface-bg: ${lightTheme.surfaces["bg.primary"]};`,
    `  --surface-bg-low: ${lightTheme.surfaces["bg.low"]};`,
    `  --surface-bg-secondary: ${lightTheme.surfaces["bg.secondary"]};`,
    `  --surface-bg-tertiary: ${lightTheme.surfaces["bg.tertiary"]};`,
    `  --surface-bg-highest: ${lightTheme.surfaces["bg.highest"]};`,
    `  --surface-border-default: ${lightTheme.surfaces["border.default"]};`,
    `  --surface-border-strong: ${lightTheme.surfaces["border.strong"]};`
  ];
  const darkSurfaceLines = [
    `  --surface-bg-lowest: ${darkTheme.surfaces["bg.lowest"]};`,
    `  --surface-bg: ${darkTheme.surfaces["bg.primary"]};`,
    `  --surface-bg-low: ${darkTheme.surfaces["bg.low"]};`,
    `  --surface-bg-secondary: ${darkTheme.surfaces["bg.secondary"]};`,
    `  --surface-bg-tertiary: ${darkTheme.surfaces["bg.tertiary"]};`,
    `  --surface-bg-highest: ${darkTheme.surfaces["bg.highest"]};`,
    `  --surface-border-default: ${darkTheme.surfaces["border.default"]};`,
    `  --surface-border-strong: ${darkTheme.surfaces["border.strong"]};`
  ];
  const darkHexBlock = `${darkHexLines.join(`
`)}
${darkSurfaceLines.join(`
`)}`;
  return [
    `:root {
${lightHexLines.join(`
`)}
${lightSurfaceLines.join(`
`)}
}`,
    `@supports (color: oklch(0 0 0)) {
  :root {
${lightOklchLines.join(`
`)}
  }
}`,
    `@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
${darkHexBlock}
  }
}`,
    `@supports (color: oklch(0 0 0)) {
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
${darkOklchLines.join(`
`)}
    }
  }
}`,
    `:root[data-theme="dark"] {
  color-scheme: dark;
${darkHexBlock}
}`,
    `@supports (color: oklch(0 0 0)) {
  :root[data-theme="dark"] {
${darkOklchLines.join(`
`)}
  }
}`
  ].join(`

`);
}
/**
 * applyBrandColor.
 * @param {*} hex
 * @param {*} options
 * @returns {*}
 */
export function applyBrandColor(hex, options = {}) {
  if (typeof document === "undefined")
    return;
  removeBrandColor();
  const css = generateBrandCSS(hex, options);
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
/**
 * removeBrandColor.
 * @returns {*}
 */
export function removeBrandColor() {
  if (typeof document === "undefined")
    return;
  const existing = document.getElementById(STYLE_ID);
  if (existing)
    existing.remove();
}
