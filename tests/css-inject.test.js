// @ts-check

/**
 * Repository module for css inject.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { generateCSSDeclarations } from "../src/css-inject.js";
import { generateShadeRamp, toOklch } from "@sig-ui/core";
function makeRamps() {
  const bgLight = toOklch("#f8fafc");
  return {
    brand: generateShadeRamp(toOklch("#6366f1"), {
      mode: "light",
      background: bgLight
    }),
    slate: generateShadeRamp(toOklch("#64748b"), {
      mode: "light",
      background: bgLight
    }),
    success: generateShadeRamp(toOklch("#22c55e"), {
      mode: "light",
      background: bgLight
    })
  };
}
const ROLES = {
  primary: { palette: "brand", shade: 500 },
  text: { palette: "slate", shade: 800 },
  "text-muted": { palette: "slate", shade: 400 },
  surface: { palette: "slate", shade: 100 },
  success: { palette: "success", shade: 500 }
};
describe("generateCSSDeclarations", () => {
  test("returns fallback and oklch pair", () => {
    const ramps = makeRamps();
    const result = generateCSSDeclarations(ramps, ROLES);
    expect(result).toHaveProperty("fallback");
    expect(result).toHaveProperty("oklch");
  });
  test("fallback contains hex values, no oklch()", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).toContain("#");
    expect(fallback).toContain("--brand-500:");
    expect(fallback).toContain("--slate-100:");
    expect(fallback).not.toContain("oklch(");
  });
  test("oklch contains oklch() values", () => {
    const ramps = makeRamps();
    const { oklch } = generateCSSDeclarations(ramps, ROLES);
    expect(oklch).toContain("oklch(");
    expect(oklch).toContain("--brand-500:");
  });
  test("semantic role aliases only in fallback", () => {
    const ramps = makeRamps();
    const { fallback, oklch } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).toContain("--primary: var(--brand-500)");
    expect(fallback).toContain("--text: var(--slate-800)");
    expect(fallback).toContain("--surface: var(--slate-100)");
    expect(oklch).not.toContain("--primary:");
    expect(oklch).not.toContain("--text:");
  });
  test("generates auto-derived interaction states in fallback", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).toContain("--primary-hover: var(--brand-600)");
    expect(fallback).toContain("--primary-active: var(--brand-700)");
    expect(fallback).toContain("--primary-subtle: var(--brand-100)");
    expect(fallback).toContain("--text-hover: var(--slate-900)");
    expect(fallback).toContain("--text-active: var(--slate-950)");
    expect(fallback).toContain("--text-subtle: var(--slate-100)");
    expect(fallback).toContain("--success-hover: var(--success-600)");
    expect(fallback).toContain("--success-active: var(--success-700)");
    expect(fallback).toContain("--success-subtle: var(--success-100)");
  });
  test("generates background token when bgColor provided", () => {
    const ramps = makeRamps();
    const bgColor = toOklch("#f8fafc");
    const { fallback, oklch } = generateCSSDeclarations(ramps, ROLES, { bgColor });
    expect(fallback).toContain("--sg-bg:");
    expect(fallback).toContain("#");
    expect(oklch).toContain("--sg-bg:");
    expect(oklch).toContain("oklch(");
  });
  test("generates 12 data visualization tokens from primary hue", () => {
    const ramps = makeRamps();
    const { fallback, oklch } = generateCSSDeclarations(ramps, ROLES, {
      primaryHue: 264,
      primaryChroma: 0.12
    });
    for (let i = 1;i <= 12; i++) {
      expect(fallback).toContain(`--data-${i}: #`);
      expect(oklch).toContain(`--data-${i}: oklch(`);
    }
  });
  test("omits data tokens when primaryHue not provided", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).not.toContain("--data-1");
  });
  test("interaction state shade clamping works at extremes", () => {
    const ramps = makeRamps();
    const highRoles = { title: { palette: "slate", shade: 900 } };
    const { fallback } = generateCSSDeclarations(ramps, highRoles);
    expect(fallback).toContain("--title-hover: var(--slate-950)");
    expect(fallback).toContain("--title-active: var(--slate-950)");
  });
  test("generates pattern tokens", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).toContain("--sg-pattern-stripe:");
    expect(fallback).toContain("--sg-pattern-dot:");
    expect(fallback).toContain("--sg-pattern-cross:");
    expect(fallback).toContain("--sg-pattern-diagonal:");
  });
  test("generates dash pattern tokens", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    for (let i = 1;i <= 6; i++) {
      expect(fallback).toContain(`--sg-pattern-dash-${i}:`);
    }
  });
  test("generates shape tokens", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).toContain('--sg-shape-circle: "circle"');
    expect(fallback).toContain('--sg-shape-square: "square"');
    expect(fallback).toContain('--sg-shape-triangle: "triangle"');
    expect(fallback).toContain('--sg-shape-diamond: "diamond"');
    expect(fallback).toContain('--sg-shape-cross: "cross"');
    expect(fallback).toContain('--sg-shape-star: "star"');
  });
  test("generates data viz sizing defaults", () => {
    const ramps = makeRamps();
    const { fallback } = generateCSSDeclarations(ramps, ROLES);
    expect(fallback).toContain("--sg-data-stroke-width: 1.5px");
    expect(fallback).toContain("--sg-data-marker-size: 8px");
    expect(fallback).toContain("--sg-data-gridline-width: 1px");
  });
});
