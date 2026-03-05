// @ts-check

/**
 * SigUI DOM color manager module for color manager.
 * @module
 */
import {
  toOklch,
  fromOklch,
  generateShadeRamp,
  validateCvdPair
} from "@sig-ui/core";
import {
  mergeWithDefaults,
  DEFAULT_LIGHT_ROLES,
  deriveDarkRoles
} from "@sig-ui/theme";
import { ColorCache } from "./cache.js";
import { watchDarkMode } from "./dark-mode.js";
import { resolveColor } from "./resolver.js";
import { injectCSS, removeCSS } from "./css-inject.js";
import { getCategoricalPalette, getSequentialScale, getDivergingScale } from "./data-viz.js";

export class ColorManager {
  config;
  cache;
  _mode;
  lightRamps = {};
  darkRamps = {};
  lightRoles;
  darkRoles;
  cleanupDarkMode = null;
  constructor(options) {
    if (options.siguiConfig) {
      const resolved = mergeWithDefaults(options.siguiConfig);
      const configPalette = {};
      configPalette.brand = resolved.brand;
      if (resolved.colors) {
        Object.assign(configPalette, resolved.colors);
      }
      if (resolved.roles) {
        for (const [key, value] of Object.entries(resolved.roles)) {
          if (value)
            configPalette[key] = value;
        }
      }
      options = {
        ...options,
        palette: { ...configPalette, ...options.palette },
        backgrounds: options.backgrounds ?? { light: "#ffffff", dark: "#1a1a1a" }
      };
    }
    if (!options.palette || !options.backgrounds) {
      throw new Error("ColorManager requires `palette` and `backgrounds`, either directly or via `siguiConfig`.");
    }
    this.config = options;
    this.cache = new ColorCache(options.cache);
    this._mode = "light";
    this.lightRoles = { ...DEFAULT_LIGHT_ROLES };
    this.darkRoles = deriveDarkRoles(this.lightRoles);
    this.generateAllRamps();
    if (options.cvdValidation?.enabled !== false) {
      this.validateCvd();
    }
    if (options.autoInject !== false) {
      this.injectCSS();
    }
    if (options.watchDarkMode !== false) {
      this.cleanupDarkMode = watchDarkMode((isDark) => {
        this._mode = isDark ? "dark" : "light";
      });
    }
  }
  get mode() {
    return this._mode;
  }
  setMode(mode) {
    this._mode = mode;
  }
  getColor(name, options = {}) {
    const context = this.getResolverContext();
    return resolveColor(name, context, options);
  }
  injectCSS() {
    injectCSS(this.lightRamps, this.darkRamps, this.lightRoles, this.darkRoles, {
      backgrounds: this.config.backgrounds,
      dataColors: this.config.dataColors
    });
  }
  removeCSS() {
    removeCSS();
  }
  getCategoricalPalette(count, options = {}) {
    const { format = "hex", ...rest } = options;
    const dataColors = this.config.dataColors ?? [];
    const ramps = this._mode === "dark" ? this.darkRamps : this.lightRamps;
    const colors = getCategoricalPalette(dataColors, ramps, count, rest);
    return colors.map((c) => fromOklch(c, format));
  }
  getDataScale(startRole, endRole, steps, format = "hex") {
    const context = this.getResolverContext();
    const startColor = resolveColor(startRole, context, { format: "oklch" });
    const endColor = resolveColor(endRole, context, { format: "oklch" });
    const colors = getSequentialScale(startColor, endColor, steps);
    return colors.map((c) => fromOklch(c, format));
  }
  destroy() {
    this.removeCSS();
    if (this.cleanupDarkMode) {
      this.cleanupDarkMode();
      this.cleanupDarkMode = null;
    }
  }
  generateAllRamps() {
    const cacheKey = ColorCache.cacheKey(this.config.name ?? "default", this.config);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      for (const [key, ramp] of Object.entries(cached)) {
        if (key.startsWith("light:")) {
          this.lightRamps[key.slice(6)] = ramp;
        } else if (key.startsWith("dark:")) {
          this.darkRamps[key.slice(5)] = ramp;
        }
      }
      this.cache.evictStale(cacheKey);
      return;
    }
    const bgLight = toOklch(this.config.backgrounds.light);
    const bgDark = toOklch(this.config.backgrounds.dark);
    for (const [name, hex] of Object.entries(this.config.palette)) {
      const base = toOklch(hex);
      this.lightRamps[name] = generateShadeRamp(base, {
        mode: "light",
        background: bgLight,
        hkCompensation: this.config.hkCompensation ?? true,
        huntCompensation: this.config.huntCompensation ?? true,
        hueBlend: this.config.hueBlend ?? false,
        extendedStops: this.config.extendedStops ?? true,
        strictWCAG: this.config.strictWCAG ?? false
      });
      this.darkRamps[name] = generateShadeRamp(base, {
        mode: "dark",
        background: bgDark,
        hkCompensation: this.config.hkCompensation ?? true,
        huntCompensation: this.config.huntCompensation ?? true,
        hueBlend: this.config.hueBlend ?? false,
        extendedStops: this.config.extendedStops ?? true,
        strictWCAG: this.config.strictWCAG ?? false
      });
    }
    const cacheData = {};
    for (const [name, ramp] of Object.entries(this.lightRamps)) {
      cacheData[`light:${name}`] = ramp;
    }
    for (const [name, ramp] of Object.entries(this.darkRamps)) {
      cacheData[`dark:${name}`] = ramp;
    }
    this.cache.set(cacheKey, cacheData);
    this.cache.evictStale(cacheKey);
  }
  validateCvd() {
    const pairs = [
      ["success", "danger"],
      ["success", "warning"],
      ["warning", "danger"],
      ["info", "primary"]
    ];
    const types = this.config.cvdValidation?.types ?? ["protan", "deutan"];
    const minDelta = this.config.cvdValidation?.minDeltaEOK ?? 0.05;
    for (const [a, b] of pairs) {
      const colorA = this.config.palette[a];
      const colorB = this.config.palette[b];
      if (!colorA || !colorB)
        continue;
      const result = validateCvdPair(colorA, colorB, types, minDelta);
      if (!result.pass) {
        console.warn(`[sigui] CVD warning: "${a}" and "${b}" may be indistinguishable under ${result.worstType} (deltaEOK: ${result.minDelta.toFixed(3)})`);
      }
    }
  }
  getResolverContext() {
    return {
      ramps: this._mode === "dark" ? this.darkRamps : this.lightRamps,
      roles: this._mode === "dark" ? this.darkRoles : this.lightRoles,
      mode: this._mode
    };
  }
}
