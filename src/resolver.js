// @ts-check

/**
 * SigUI DOM resolver module for resolver.
 * @module
 */
import { toOklch, fromOklch, apcaContrast } from "@sig-ui/core";
import { getInteractionShades } from "@sig-ui/theme";
const SHADE_REGEX = /^(.+?)[@-](\d+)$/;

/** @typedef {{ l: number, c: number, h: number, alpha: number }} OklchColor */
/** @typedef {{ palette: string, shade: number }} RoleMapping */
/** @typedef {{ ramps: Record<string, Record<number, OklchColor>>, roles: Record<string, RoleMapping>, mode: "light" | "dark" }} ResolverContext */
/** @typedef {{ format?: "hex" | "oklch", against?: string }} ResolveColorOptions */
/** @typedef {{ role: string, palette: string, shade: number, type: "semantic" | "raw" | "interaction" | "hex" }} ResolvedRole */

/**
 * resolveColor.
 * @param {string} name
 * @param {ResolverContext} context
 * @param {ResolveColorOptions} [options]
 * @returns {string}
 */
export function resolveColor(name, context, options = {}) {
  const { format = "oklch" } = options;
  const color = resolveToOklch(name, context);
  if (!color)
    return name;
  if (options.against) {
    const bgColor = resolveToOklch(options.against, context);
    if (bgColor) {
      const adjusted = ensureContrastAgainst(color, bgColor, context.mode);
      return fromOklch(adjusted, format);
    }
  }
  return fromOklch(color, format);
}
function resolveToOklch(name, context) {
  if (name.startsWith("#")) {
    return toOklch(name);
  }
  const shadeMatch = SHADE_REGEX.exec(name);
  if (shadeMatch) {
    const paletteName = shadeMatch[1];
    const shade = parseInt(shadeMatch[2], 10);
    const ramp = context.ramps[paletteName];
    if (ramp && ramp[shade])
      return ramp[shade];
  }
  if (name.endsWith("-hover") || name.endsWith("-active") || name.endsWith("-subtle")) {
    return resolveInteractionState(name, context);
  }
  const roleMapping = context.roles[name];
  if (roleMapping) {
    const ramp = context.ramps[roleMapping.palette];
    if (ramp?.[roleMapping.shade])
      return ramp[roleMapping.shade];
  }
  const ramp = context.ramps[name];
  if (ramp && ramp[500])
    return ramp[500];
  return null;
}
function resolveInteractionState(name, context) {
  let baseName;
  if (name.endsWith("-subtle")) {
    baseName = name.slice(0, -7);
    const roleMapping = context.roles[baseName];
    if (roleMapping) {
      const { subtle } = getInteractionShades(roleMapping.shade, context.mode);
      const ramp = context.ramps[roleMapping.palette];
      if (ramp?.[subtle])
        return ramp[subtle];
    }
    const ramp = context.ramps[baseName];
    if (ramp?.[context.mode === "dark" ? 900 : 100])
      return ramp[context.mode === "dark" ? 900 : 100];
    return null;
  }
  let shadeOffset;
  if (name.endsWith("-hover")) {
    baseName = name.slice(0, -6);
    shadeOffset = 100;
  } else {
    baseName = name.slice(0, -7);
    shadeOffset = 200;
  }
  const roleMapping = context.roles[baseName];
  if (roleMapping) {
    const interactionShades = getInteractionShades(roleMapping.shade, context.mode);
    const targetShade = shadeOffset === 100 ? interactionShades.hover : interactionShades.active;
    const ramp = context.ramps[roleMapping.palette];
    if (ramp?.[targetShade])
      return ramp[targetShade];
  }
  return null;
}
function ensureContrastAgainst(color, bg, mode) {
  const currentLc = Math.abs(apcaContrast(color, bg));
  const minLc = 55;
  if (currentLc >= minLc)
    return color;
  let l = color.l;
  const step = mode === "dark" ? 0.01 : -0.01;
  for (let i = 0;i < 100; i++) {
    l += step;
    if (l < 0 || l > 1)
      break;
    const candidate = { ...color, l };
    const lc = Math.abs(apcaContrast(candidate, bg));
    if (lc >= minLc)
      return candidate;
  }
  return color;
}
/**
 * resolveRole.
 * @param {string} name
 * @param {ResolverContext} context
 * @returns {ResolvedRole | null}
 */
export function resolveRole(name, context) {
  if (name.startsWith("#")) {
    return { role: name, palette: name, shade: 500, type: "hex" };
  }
  const shadeMatch = SHADE_REGEX.exec(name);
  if (shadeMatch) {
    const paletteName = shadeMatch[1];
    const shade = parseInt(shadeMatch[2], 10);
    const ramp = context.ramps[paletteName];
    if (ramp && ramp[shade]) {
      return { role: name, palette: paletteName, shade, type: "raw" };
    }
  }
  if (name.endsWith("-hover") || name.endsWith("-active") || name.endsWith("-subtle")) {
    return resolveInteractionMeta(name, context);
  }
  const roleMapping = context.roles[name];
  if (roleMapping) {
    return {
      role: name,
      palette: roleMapping.palette,
      shade: roleMapping.shade,
      type: "semantic"
    };
  }
  const ramp = context.ramps[name];
  if (ramp && ramp[500]) {
    return { role: name, palette: name, shade: 500, type: "raw" };
  }
  return null;
}
function resolveInteractionMeta(name, context) {
  if (name.endsWith("-subtle")) {
    const baseName = name.slice(0, -7);
    const roleMapping = context.roles[baseName];
    if (roleMapping) {
      return { role: name, palette: roleMapping.palette, shade: 100, type: "interaction" };
    }
    if (context.ramps[baseName]) {
      return { role: name, palette: baseName, shade: 100, type: "interaction" };
    }
    return null;
  }
  let baseName;
  if (name.endsWith("-hover")) {
    baseName = name.slice(0, -6);
  } else {
    baseName = name.slice(0, -7);
  }
  const roleMapping = context.roles[baseName];
  if (roleMapping) {
    const { hover, active } = getInteractionShades(roleMapping.shade, context.mode);
    const targetShade = name.endsWith("-hover") ? hover : active;
    return { role: name, palette: roleMapping.palette, shade: targetShade, type: "interaction" };
  }
  return null;
}
