// @ts-check

/**
 * Repository module for brand runtime.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { generateBrandCSS } from "../src/brand-runtime.js";
describe("generateBrandCSS", () => {
  const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  test("returns a string containing all 11 --brand-* stops", () => {
    const css = generateBrandCSS("#6366f1");
    for (const stop of STOPS) {
      expect(css).toContain(`--brand-${stop}:`);
    }
  });
  test("contains :root block", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toContain(":root {");
  });
  test("contains @supports (color: oklch(0 0 0)) block", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toContain("@supports (color: oklch(0 0 0))");
  });
  test("contains @media (prefers-color-scheme: dark) block", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toContain("@media (prefers-color-scheme: dark)");
  });
  test("contains combined @supports + @media dark block", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toMatch(/@supports \(color: oklch\(0 0 0\)\) \{\s*@media \(prefers-color-scheme: dark\)/);
  });
  test("contains manual dark mode [data-theme] selectors", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain("color-scheme: dark");
  });
  test("auto dark excludes explicit data-theme", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toContain(":root:not([data-theme])");
  });
  test("different hex inputs produce different output", () => {
    const red = generateBrandCSS("#ff0000");
    const blue = generateBrandCSS("#0000ff");
    expect(red).not.toBe(blue);
  });
  test("works with pure white", () => {
    const css = generateBrandCSS("#ffffff");
    for (const stop of STOPS) {
      expect(css).toContain(`--brand-${stop}:`);
    }
  });
  test("works with pure black", () => {
    const css = generateBrandCSS("#000000");
    for (const stop of STOPS) {
      expect(css).toContain(`--brand-${stop}:`);
    }
  });
  test("works with saturated red", () => {
    const css = generateBrandCSS("#ff0000");
    for (const stop of STOPS) {
      expect(css).toContain(`--brand-${stop}:`);
    }
  });
  test("hex fallback block contains # hex values", () => {
    const css = generateBrandCSS("#6366f1");
    const rootBlock = css.split("@supports")[0];
    expect(rootBlock).toMatch(/#[0-9a-f]{6}/i);
  });
  test("oklch block contains oklch() values", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toMatch(/oklch\(\d/);
  });
  test("accepts custom background option", () => {
    const css = generateBrandCSS("#6366f1", { background: "#f0f0f0" });
    for (const stop of STOPS) {
      expect(css).toContain(`--brand-${stop}:`);
    }
  });
  test("contains surface palette primitives", () => {
    const css = generateBrandCSS("#6366f1");
    expect(css).toContain("--surface-bg:");
    expect(css).toContain("--surface-bg-secondary:");
    expect(css).toContain("--surface-bg-tertiary:");
    expect(css).toContain("--surface-border-default:");
    expect(css).toContain("--surface-border-strong:");
  });
  test("dark mode overrides surface primitives", () => {
    const css = generateBrandCSS("#6366f1");
    const darkBlock = css.split("@media (prefers-color-scheme: dark)")[1];
    expect(darkBlock).toContain("--surface-bg:");
    expect(darkBlock).toContain("--surface-bg-secondary:");
  });
  test("accepts custom tintStrength option", () => {
    const lowTint = generateBrandCSS("#6366f1", { tintStrength: 0 });
    const highTint = generateBrandCSS("#6366f1", { tintStrength: 1 });
    expect(lowTint).toContain("--surface-bg:");
    expect(highTint).toContain("--surface-bg:");
    expect(lowTint).not.toBe(highTint);
  });
});
