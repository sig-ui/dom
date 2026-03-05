// @ts-check

/**
 * Repository module for device context.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  collectClassificationSignals,
  collectDisplaySignals,
  collectAmbientSignals,
  collectRefreshRate,
  collectColorDepth,
  collectOrientation,
  detectTier,
  createDeviceContext
} from "../src/device/context.js";
import { watchDPR } from "../src/device/monitors.js";
import { applyAdaptiveTokens, removeAdaptiveTokens } from "../src/device/tokens.js";
import { DEFAULT_DEVICE_CONTEXT } from "@sig-ui/core";
describe("collectClassificationSignals (non-browser)", () => {
  test("returns desktop-like defaults", () => {
    const signals = collectClassificationSignals();
    expect(signals.screenWidth).toBe(1440);
    expect(signals.pointerFine).toBe(true);
    expect(signals.pointerCoarse).toBe(false);
    expect(signals.maxTouchPoints).toBe(0);
  });
});
describe("collectDisplaySignals (non-browser)", () => {
  test("returns sRGB defaults", () => {
    const signals = collectDisplaySignals();
    expect(signals.dynamicRangeHigh).toBe(false);
    expect(signals.gamutP3).toBe(false);
    expect(signals.gamutRec2020).toBe(false);
  });
});
describe("collectAmbientSignals (non-browser)", () => {
  test("returns light/no-preference defaults", () => {
    const signals = collectAmbientSignals();
    expect(signals.colorScheme).toBe("light");
    expect(signals.contrastPreference).toBe("none");
    expect(signals.reducedMotion).toBe(false);
    expect(signals.reducedTransparency).toBe(false);
    expect(signals.forcedColors).toBe(false);
  });
});
describe("collectRefreshRate (non-browser)", () => {
  test("returns 60Hz default", () => {
    expect(collectRefreshRate()).toBe(60);
  });
});
describe("collectColorDepth (non-browser)", () => {
  test("returns 8-bit default", () => {
    expect(collectColorDepth()).toBe(8);
  });
});
describe("collectOrientation (non-browser)", () => {
  test("returns landscape default", () => {
    expect(collectOrientation()).toBe("landscape");
  });
});
describe("detectTier (non-browser)", () => {
  test("returns tier 1", () => {
    expect(detectTier()).toBe(1);
  });
});
describe("createDeviceContext (non-browser)", () => {
  test("returns DEFAULT_DEVICE_CONTEXT", () => {
    const ctx = createDeviceContext();
    expect(ctx).toEqual(DEFAULT_DEVICE_CONTEXT);
  });
});
describe("watchDPR (non-browser)", () => {
  test("returns no-op cleanup function", () => {
    const cleanup = watchDPR(() => {});
    expect(typeof cleanup).toBe("function");
    cleanup();
  });
});
describe("applyAdaptiveTokens (non-browser)", () => {
  test("does not throw without DOM", () => {
    expect(() => applyAdaptiveTokens(DEFAULT_DEVICE_CONTEXT)).not.toThrow();
  });
});
describe("removeAdaptiveTokens (non-browser)", () => {
  test("does not throw without DOM", () => {
    expect(() => removeAdaptiveTokens()).not.toThrow();
  });
});
