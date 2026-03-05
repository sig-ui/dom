// @ts-check

/**
 * Repository module for canvas.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { applyToCanvas } from "../src/canvas.js";
import { ColorManager } from "../src/color-manager.js";
function makeManager() {
  return new ColorManager({
    palette: {
      brand: "#6366f1",
      slate: "#64748b",
      accent: "#ec4899",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#3b82f6"
    },
    backgrounds: { light: "#f8fafc", dark: "#0f172a" },
    autoInject: false,
    watchDarkMode: false
  });
}
describe("applyToCanvas", () => {
  test("returns CanvasThemeColors facade", () => {
    const mgr = makeManager();
    const canvas = applyToCanvas(mgr);
    expect(canvas).toHaveProperty("getColor");
    expect(canvas).toHaveProperty("getDataPalette");
    expect(canvas).toHaveProperty("mode");
  });
  test("getColor returns hex by default", () => {
    const mgr = makeManager();
    const canvas = applyToCanvas(mgr);
    const color = canvas.getColor("primary");
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
  test("getColor returns rgb() when format is rgb", () => {
    const mgr = makeManager();
    const canvas = applyToCanvas(mgr);
    const color = canvas.getColor("primary", "rgb");
    expect(color).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
  });
  test("getDataPalette returns array of hex colors", () => {
    const mgr = makeManager();
    const canvas = applyToCanvas(mgr);
    const palette = canvas.getDataPalette(5);
    expect(palette).toHaveLength(5);
    for (const color of palette) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
  test("mode reflects manager mode", () => {
    const mgr = makeManager();
    const canvas = applyToCanvas(mgr);
    expect(canvas.mode).toBe("light");
    mgr.setMode("dark");
    expect(canvas.mode).toBe("dark");
  });
});
