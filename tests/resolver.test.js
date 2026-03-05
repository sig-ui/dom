// @ts-check

/**
 * Repository module for resolver.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { resolveColor, resolveRole } from "../src/resolver.js";
import { generateShadeRamp, toOklch } from "@sig-ui/core";
function makeContext() {
  const bgLight = toOklch("#f8fafc");
  const brandRamp = generateShadeRamp(toOklch("#6366f1"), {
    mode: "light",
    background: bgLight
  });
  const slateRamp = generateShadeRamp(toOklch("#64748b"), {
    mode: "light",
    background: bgLight
  });
  const successRamp = generateShadeRamp(toOklch("#22c55e"), {
    mode: "light",
    background: bgLight
  });
  const dangerRamp = generateShadeRamp(toOklch("#ef4444"), {
    mode: "light",
    background: bgLight
  });
  const accentRamp = generateShadeRamp(toOklch("#ec4899"), {
    mode: "light",
    background: bgLight
  });
  return {
    ramps: {
      brand: brandRamp,
      slate: slateRamp,
      success: successRamp,
      danger: dangerRamp,
      accent: accentRamp
    },
    roles: {
      primary: { palette: "brand", shade: 500 },
      text: { palette: "slate", shade: 800 },
      "text-muted": { palette: "slate", shade: 400 },
      surface: { palette: "slate", shade: 100 },
      accent: { palette: "accent", shade: 500 },
      highlight: { palette: "brand", shade: 300 },
      success: { palette: "success", shade: 500 },
      danger: { palette: "danger", shade: 500 }
    },
    mode: "light"
  };
}
describe("resolver", () => {
  test("hex passthrough", () => {
    const ctx = makeContext();
    const result = resolveColor("#ff0000", ctx, { format: "hex" });
    expect(result).toBe("#ff0000");
  });
  test("numbered shade resolution", () => {
    const ctx = makeContext();
    const result = resolveColor("brand@500", ctx, { format: "hex" });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  test("numbered shade with dash", () => {
    const ctx = makeContext();
    const result = resolveColor("brand-500", ctx, { format: "hex" });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  test("semantic role resolution", () => {
    const ctx = makeContext();
    const result = resolveColor("primary", ctx, { format: "hex" });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  test("raw palette name returns 500", () => {
    const ctx = makeContext();
    const result = resolveColor("brand", ctx, { format: "hex" });
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
  test("hover state resolves", () => {
    const ctx = makeContext();
    const base = resolveColor("primary", ctx, { format: "oklch" });
    const hover = resolveColor("primary-hover", ctx, { format: "oklch" });
    expect(hover).not.toBe(base);
  });
  test("subtle state resolves to shade 100", () => {
    const ctx = makeContext();
    const subtle = resolveColor("primary-subtle", ctx, { format: "oklch" });
    expect(subtle).toBeDefined();
    expect(subtle).toMatch(/^oklch\(/);
  });
  test("new core semantic roles resolve", () => {
    const ctx = makeContext();
    expect(resolveColor("accent", ctx, { format: "hex" })).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolveColor("success", ctx, { format: "hex" })).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolveColor("danger", ctx, { format: "hex" })).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolveColor("highlight", ctx, { format: "hex" })).toMatch(/^#[0-9a-f]{6}$/);
  });
  test("interaction states for new roles resolve", () => {
    const ctx = makeContext();
    const successHover = resolveColor("success-hover", ctx, { format: "oklch" });
    expect(successHover).toMatch(/^oklch\(/);
    const dangerActive = resolveColor("danger-active", ctx, { format: "oklch" });
    expect(dangerActive).toMatch(/^oklch\(/);
    const accentSubtle = resolveColor("accent-subtle", ctx, { format: "oklch" });
    expect(accentSubtle).toMatch(/^oklch\(/);
  });
  test("active state resolves", () => {
    const ctx = makeContext();
    const base = resolveColor("primary", ctx, { format: "oklch" });
    const active = resolveColor("primary-active", ctx, { format: "oklch" });
    expect(active).not.toBe(base);
  });
});
describe("resolveRole", () => {
  test("hex passthrough returns hex type", () => {
    const ctx = makeContext();
    const result = resolveRole("#ff0000", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("hex");
    expect(result.palette).toBe("#ff0000");
  });
  test("numbered shade returns raw type", () => {
    const ctx = makeContext();
    const result = resolveRole("brand@500", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("raw");
    expect(result.palette).toBe("brand");
    expect(result.shade).toBe(500);
  });
  test("semantic role returns semantic type", () => {
    const ctx = makeContext();
    const result = resolveRole("primary", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("semantic");
    expect(result.palette).toBe("brand");
    expect(result.shade).toBe(500);
  });
  test("raw palette name returns raw type with shade 500", () => {
    const ctx = makeContext();
    const result = resolveRole("brand", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("raw");
    expect(result.palette).toBe("brand");
    expect(result.shade).toBe(500);
  });
  test("hover interaction returns interaction type", () => {
    const ctx = makeContext();
    const result = resolveRole("primary-hover", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("interaction");
    expect(result.palette).toBe("brand");
    expect(result.shade).toBe(600);
  });
  test("active interaction returns interaction type", () => {
    const ctx = makeContext();
    const result = resolveRole("primary-active", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("interaction");
    expect(result.palette).toBe("brand");
    expect(result.shade).toBe(700);
  });
  test("subtle interaction returns shade 100", () => {
    const ctx = makeContext();
    const result = resolveRole("primary-subtle", ctx);
    expect(result).not.toBeNull();
    expect(result.type).toBe("interaction");
    expect(result.shade).toBe(100);
  });
  test("unknown name returns null", () => {
    const ctx = makeContext();
    const result = resolveRole("nonexistent", ctx);
    expect(result).toBeNull();
  });
});
