// @ts-check

/**
 * SigUI DOM css inject module for css inject.
 * @module
 */
import { fromOklch, toOklch, isInGamut, clampToGamut, clamp, normalizeHue, ALL_STOPS } from "@sig-ui/core";
import { getInteractionShades } from "@sig-ui/theme";
const STYLE_ID = "sg-theme-vars";
const VALID_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
function toSrgbHex(color) {
  const srgb = isInGamut(color, "srgb") ? color : clampToGamut(color, "srgb");
  return fromOklch(srgb, "hex");
}
/**
 * generateCSSDeclarations.
 * @param {*} ramps
 * @param {*} roles
 * @param {*} options
 * @returns {*}
 */
export function generateCSSDeclarations(ramps, roles, options = {}) {
  const fallbackLines = [];
  const oklchLines = [];
  for (const [name, ramp] of Object.entries(ramps)) {
    for (const stop of ALL_STOPS) {
      const color = ramp[stop];
      if (color) {
        fallbackLines.push(`  --${name}-${stop}: ${toSrgbHex(color)};`);
        oklchLines.push(`  --${name}-${stop}: ${fromOklch(color, "oklch")};`);
      }
    }
  }
  if (options.bgColor) {
    fallbackLines.push(`  --sg-bg: ${toSrgbHex(options.bgColor)};`);
    oklchLines.push(`  --sg-bg: ${fromOklch(options.bgColor, "oklch")};`);
  }
  for (const [role, mapping] of Object.entries(roles)) {
    fallbackLines.push(`  --${role}: var(--${mapping.palette}-${mapping.shade});`);
  }
  for (const [role, mapping] of Object.entries(roles)) {
    const { palette, shade } = mapping;
    const { hover, active, subtle } = getInteractionShades(shade, options.mode ?? "light");
    fallbackLines.push(`  --${role}-hover: var(--${palette}-${hover});`);
    fallbackLines.push(`  --${role}-active: var(--${palette}-${active});`);
    fallbackLines.push(`  --${role}-subtle: var(--${palette}-${subtle});`);
  }
  for (const role of Object.keys(roles)) {
    fallbackLines.push(`  --sg-color-${role}: var(--${role});`);
  }
  if (options.primaryHue !== undefined) {
    const dataL = 0.55;
    const dataC = clamp(options.primaryChroma ?? 0.12, 0.08, 0.15);
    for (let i = 0;i < 12; i++) {
      const hue = normalizeHue(options.primaryHue + i * 30);
      const color = { l: dataL, c: dataC, h: hue, alpha: 1 };
      const hex = toSrgbHex(color);
      fallbackLines.push(`  --data-${i + 1}: ${hex};`);
      oklchLines.push(`  --data-${i + 1}: ${fromOklch(color, "oklch")};`);
    }
  }
  fallbackLines.push(`  --sg-pattern-stripe: repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 8px);`);
  fallbackLines.push(`  --sg-pattern-dot: radial-gradient(circle 1.5px, currentColor 100%, transparent 100%) 0 0 / 8px 8px;`);
  fallbackLines.push(`  --sg-pattern-cross: repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 8px), repeating-linear-gradient(-45deg, currentColor 0 2px, transparent 2px 8px);`);
  fallbackLines.push(`  --sg-pattern-diagonal: repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 8px);`);
  for (let i = 1;i <= 6; i++) {
    const dash = i * 4;
    const gap = i * 2;
    fallbackLines.push(`  --sg-pattern-dash-${i}: ${dash} ${gap};`);
  }
  const shapes = ["circle", "square", "triangle", "diamond", "cross", "star"];
  for (const shape of shapes) {
    fallbackLines.push(`  --sg-shape-${shape}: "${shape}";`);
  }
  fallbackLines.push(`  --sg-data-stroke-width: 1.5px;`);
  fallbackLines.push(`  --sg-data-marker-size: 8px;`);
  fallbackLines.push(`  --sg-data-gridline-width: 1px;`);
  return {
    fallback: fallbackLines.join(`
`),
    oklch: oklchLines.join(`
`)
  };
}
/**
 * injectCSS.
 * @param {*} lightRamps
 * @param {*} darkRamps
 * @param {*} lightRoles
 * @param {*} darkRoles
 * @param {*} options
 * @returns {*}
 */
export function injectCSS(lightRamps, darkRamps, lightRoles, darkRoles, options = {}) {
  if (typeof document === "undefined")
    return;
  removeCSS();
  const bgLightOklch = options.backgrounds ? toOklch(options.backgrounds.light) : undefined;
  const bgDarkOklch = options.backgrounds ? toOklch(options.backgrounds.dark) : undefined;
  const primaryOklch = options.primaryColor ? toOklch(options.primaryColor) : undefined;
  const lightDecl = generateCSSDeclarations(lightRamps, lightRoles, {
    bgColor: bgLightOklch,
    primaryHue: primaryOklch?.h,
    primaryChroma: primaryOklch?.c
  });
  const darkDecl = generateCSSDeclarations(darkRamps, darkRoles, {
    bgColor: bgDarkOklch,
    primaryHue: primaryOklch?.h,
    primaryChroma: primaryOklch?.c
  });
  const innerCss = [
    `:root {
${lightDecl.fallback}
}`,
    `@supports (color: oklch(0 0 0)) {
  :root {
${lightDecl.oklch}
  }
}`,
    `@media (prefers-color-scheme: dark) {
  :root {
${darkDecl.fallback}
  }
}`,
    `@supports (color: oklch(0 0 0)) {
  @media (prefers-color-scheme: dark) {
    :root {
${darkDecl.oklch}
    }
  }
}`
  ].join(`

`);
  const css = `@layer sigui.runtime {
${innerCss}
}`;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}
/**
 * removeCSS.
 * @returns {*}
 */
export function removeCSS() {
  if (typeof document === "undefined")
    return;
  const existing = document.getElementById(STYLE_ID);
  if (existing)
    existing.remove();
}
function clampToValidStop(shade) {
  return VALID_STOPS.reduce((prev, curr) => Math.abs(curr - shade) < Math.abs(prev - shade) ? curr : prev);
}
