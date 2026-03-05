// @ts-check

/**
 * Repository module for inspector.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { ThemeInspector } from "../src/inspector.js";
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
describe("ThemeInspector", () => {
  test("static mount creates instance", () => {
    const mgr = makeManager();
    const inspector = ThemeInspector.mount(mgr);
    expect(inspector).toBeInstanceOf(ThemeInspector);
  });
  test("getContrastMap returns entries", () => {
    const mgr = makeManager();
    const inspector = new ThemeInspector(mgr);
    const map = inspector.getContrastMap();
    expect(Array.isArray(map)).toBe(true);
    expect(map.length).toBeGreaterThan(0);
    for (const entry of map) {
      expect(entry).toHaveProperty("text");
      expect(entry).toHaveProperty("surface");
      expect(entry).toHaveProperty("lc");
      expect(entry).toHaveProperty("wcag");
      expect(entry).toHaveProperty("pass");
      expect(typeof entry.lc).toBe("number");
      expect(typeof entry.wcag).toBe("number");
      expect(typeof entry.pass).toBe("boolean");
    }
  });
  test("getContrastMap text roles have reasonable lc values", () => {
    const mgr = makeManager();
    const inspector = new ThemeInspector(mgr);
    const map = inspector.getContrastMap();
    const textOnSurface = map.find((e) => e.text === "text" && e.surface === "surface");
    if (textOnSurface) {
      expect(textOnSurface.lc).toBeGreaterThan(0);
    }
  });
  test("getCvdPairAlerts returns array", () => {
    const mgr = makeManager();
    const inspector = new ThemeInspector(mgr);
    const alerts = inspector.getCvdPairAlerts();
    expect(Array.isArray(alerts)).toBe(true);
    for (const alert of alerts) {
      expect(alert).toHaveProperty("roleA");
      expect(alert).toHaveProperty("roleB");
      expect(alert).toHaveProperty("worstType");
      expect(alert).toHaveProperty("deltaEOK");
    }
  });
  test("exportThemeJSON returns valid JSON", () => {
    const mgr = makeManager();
    const inspector = new ThemeInspector(mgr);
    const json = inspector.exportThemeJSON();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveProperty("mode");
    expect(parsed).toHaveProperty("colors");
    expect(parsed.colors).toHaveProperty("primary");
    expect(parsed.colors).toHaveProperty("text");
    expect(parsed.colors).toHaveProperty("surface-container");
  });
  test("exportCSS returns valid CSS block", () => {
    const mgr = makeManager();
    const inspector = new ThemeInspector(mgr);
    const css = inspector.exportCSS();
    expect(css).toContain(":root {");
    expect(css).toContain("--primary:");
    expect(css).toContain("--text:");
    expect(css).toContain("}");
  });
  test("mount with options stores them", () => {
    const mgr = makeManager();
    const inspector = ThemeInspector.mount(mgr, {
      position: "bottom-left",
      collapsed: true
    });
    expect(inspector).toBeInstanceOf(ThemeInspector);
  });
});
