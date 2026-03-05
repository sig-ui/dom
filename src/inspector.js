// @ts-check

/**
 * SigUI DOM inspector module for inspector.
 * @module
 */
import { apcaContrast, wcag2Contrast, fromOklch, validateCvdPair } from "@sig-ui/core";
const TEXT_ROLES = ["text", "title", "subtitle", "link", "emphasis", "text-secondary", "text-muted"];
const SURFACE_ROLES = ["surface-container", "surface-container-low", "surface-container-high", "primary-subtle", "secondary-subtle"];
const STATUS_ROLES = ["success", "warning", "danger", "info"];
const MIN_LC = 55;

export class ThemeInspector {
  manager;
  options;
  constructor(manager, options = {}) {
    this.manager = manager;
    this.options = options;
  }
  getContrastMap() {
    const entries = [];
    for (const text of TEXT_ROLES) {
      for (const surface of SURFACE_ROLES) {
        const textColor = this.manager.getColor(text, { format: "oklch" });
        const surfaceColor = this.manager.getColor(surface, { format: "oklch" });
        if (!textColor.startsWith("oklch(") || !surfaceColor.startsWith("oklch("))
          continue;
        const textOklch = parseOklchString(textColor);
        const surfaceOklch = parseOklchString(surfaceColor);
        if (!textOklch || !surfaceOklch)
          continue;
        const lc = Math.abs(apcaContrast(textOklch, surfaceOklch));
        const wcag = wcag2Contrast(textOklch, surfaceOklch);
        entries.push({
          text,
          surface,
          lc,
          wcag,
          pass: lc >= MIN_LC
        });
      }
    }
    return entries;
  }
  getCvdPairAlerts() {
    const alerts = [];
    const rolePairs = [
      ["success", "danger"],
      ["success", "warning"],
      ["warning", "danger"],
      ["info", "primary"]
    ];
    const types = ["protan", "deutan"];
    for (const [a, b] of rolePairs) {
      const colorA = this.manager.getColor(a, { format: "hex" });
      const colorB = this.manager.getColor(b, { format: "hex" });
      if (!colorA.startsWith("#") || !colorB.startsWith("#"))
        continue;
      const result = validateCvdPair(colorA, colorB, types, 0.05);
      if (!result.pass) {
        alerts.push({
          roleA: a,
          roleB: b,
          worstType: result.worstType,
          deltaEOK: result.minDelta
        });
      }
    }
    return alerts;
  }
  exportThemeJSON() {
    const data = {};
    const allRoles = [...TEXT_ROLES, ...SURFACE_ROLES, ...STATUS_ROLES, "primary", "secondary", "accent", "highlight"];
    for (const role of allRoles) {
      data[role] = this.manager.getColor(role, { format: "hex" });
    }
    return JSON.stringify({ mode: this.manager.mode, colors: data }, null, 2);
  }
  exportCSS() {
    const lines = [];
    lines.push(":root {");
    const allRoles = [...TEXT_ROLES, ...SURFACE_ROLES, ...STATUS_ROLES, "primary", "secondary", "accent", "highlight"];
    for (const role of allRoles) {
      const hex = this.manager.getColor(role, { format: "hex" });
      lines.push(`  --${role}: ${hex};`);
    }
    lines.push("}");
    return lines.join(`
`);
  }
  static mount(manager, options = {}) {
    return new ThemeInspector(manager, options);
  }
}
function parseOklchString(str) {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(str);
  if (!match)
    return null;
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
    alpha: match[4] !== undefined ? parseFloat(match[4]) : 1
  };
}
