// @ts-check

/**
 * Repository module for animate resolve.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  resolveDuration,
  resolveEasing,
  expandKeyframes,
  buildWaapiKeyframes,
  readDurationScalar
} from "../src/animate/resolve.js";
describe("resolveDuration", () => {
  test("named token 'normal' resolves to 200ms", () => {
    expect(resolveDuration("normal", undefined, false)).toBe(200);
  });
  test("named token 'fast' resolves to 100ms", () => {
    expect(resolveDuration("fast", undefined, false)).toBe(100);
  });
  test("named token 'moderate' resolves to 300ms", () => {
    expect(resolveDuration("moderate", undefined, false)).toBe(300);
  });
  test("named token 'instant' resolves to 0ms", () => {
    expect(resolveDuration("instant", undefined, false)).toBe(0);
  });
  test("named token 'slower' resolves to 500ms", () => {
    expect(resolveDuration("slower", undefined, false)).toBe(500);
  });
  test("numeric passthrough", () => {
    expect(resolveDuration(350, undefined, false)).toBe(350);
  });
  test("undefined defaults to 200ms (normal)", () => {
    expect(resolveDuration(undefined, undefined, false)).toBe(200);
  });
});
describe("readDurationScalar", () => {
  test("returns 1 in non-browser environment", () => {
    expect(readDurationScalar()).toBe(1);
  });
});
describe("resolveEasing", () => {
  test("named curve 'default' returns cubic-bezier()", () => {
    const result = resolveEasing("default");
    expect(result).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });
  test("named curve 'in' returns correct bezier", () => {
    const result = resolveEasing("in");
    expect(result).toBe("cubic-bezier(0.4, 0, 1, 0.6)");
  });
  test("named curve 'linear' returns linear bezier", () => {
    const result = resolveEasing("linear");
    expect(result).toBe("linear");
  });
  test("spring prefix 'spring:snappy' returns linear() string", () => {
    const result = resolveEasing("spring:snappy");
    expect(result).toStartWith("linear(");
    expect(result).toContain(",");
  });
  test("spring prefix 'spring:bouncy' returns linear() string", () => {
    const result = resolveEasing("spring:bouncy");
    expect(result).toStartWith("linear(");
  });
  test("raw CSS passthrough", () => {
    const raw = "cubic-bezier(0.5, 0, 0.5, 1)";
    expect(resolveEasing(raw)).toBe(raw);
  });
  test("undefined defaults to 'default' easing", () => {
    expect(resolveEasing(undefined)).toBe("cubic-bezier(0.2, 0, 0, 1)");
  });
  test("unknown spring preset falls through to raw CSS", () => {
    const result = resolveEasing("spring:nonexistent");
    expect(result).toBe("spring:nonexistent");
  });
});
describe("expandKeyframes", () => {
  test("separates 'x' into translateX transform", () => {
    const result = expandKeyframes({ x: 100 });
    expect(result.transforms).toHaveProperty("translateX");
    expect(result.transforms.translateX).toBe(100);
    expect(Object.keys(result.properties)).toHaveLength(0);
  });
  test("separates 'y' into translateY transform", () => {
    const result = expandKeyframes({ y: [0, 50] });
    expect(result.transforms).toHaveProperty("translateY");
    expect(result.transforms.translateY).toEqual([0, 50]);
  });
  test("separates 'scale' into transform", () => {
    const result = expandKeyframes({ scale: [0.5, 1] });
    expect(result.transforms).toHaveProperty("scale");
  });
  test("separates 'rotate' into transform", () => {
    const result = expandKeyframes({ rotate: 90 });
    expect(result.transforms).toHaveProperty("rotate");
    expect(result.transforms.rotate).toBe(90);
  });
  test("keeps regular CSS properties separate", () => {
    const result = expandKeyframes({ opacity: [0, 1], x: 100 });
    expect(result.transforms).toHaveProperty("translateX");
    expect(result.properties).toHaveProperty("opacity");
    expect(result.properties.opacity).toEqual([0, 1]);
  });
  test("mixed transforms and properties", () => {
    const result = expandKeyframes({
      x: [0, 100],
      y: [20, 0],
      opacity: [0, 1],
      scale: [0.9, 1]
    });
    expect(Object.keys(result.transforms)).toHaveLength(3);
    expect(Object.keys(result.properties)).toHaveLength(1);
  });
});
describe("buildWaapiKeyframes", () => {
  test("transform shorthands get proper units (px for translate)", () => {
    const expanded = expandKeyframes({ x: [0, 100] });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(2);
    expect(keyframes[0].transform).toContain("translateX(0px)");
    expect(keyframes[1].transform).toContain("translateX(100px)");
  });
  test("rotate gets deg units", () => {
    const expanded = expandKeyframes({ rotate: [0, 90] });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(2);
    expect(keyframes[0].transform).toContain("rotate(0deg)");
    expect(keyframes[1].transform).toContain("rotate(90deg)");
  });
  test("scale is unitless", () => {
    const expanded = expandKeyframes({ scale: [0.5, 1] });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(2);
    expect(keyframes[0].transform).toContain("scale(0.5)");
    expect(keyframes[1].transform).toContain("scale(1)");
  });
  test("single value transform uses identity as from", () => {
    const expanded = expandKeyframes({ x: 100 });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(2);
    expect(keyframes[0].transform).toContain("translateX(0px)");
    expect(keyframes[1].transform).toContain("translateX(100px)");
  });
  test("multiple transforms are combined into single transform string", () => {
    const expanded = expandKeyframes({ x: [0, 50], scale: [0.9, 1] });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(2);
    const to = keyframes[1].transform;
    expect(to).toContain("translateX(50px)");
    expect(to).toContain("scale(1)");
  });
  test("regular CSS properties in keyframes", () => {
    const expanded = expandKeyframes({ opacity: [0, 1] });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(2);
    expect(keyframes[0]).toHaveProperty("opacity", 0);
    expect(keyframes[1]).toHaveProperty("opacity", 1);
  });
  test("empty keyframes produce single empty frame", () => {
    const expanded = expandKeyframes({});
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes).toHaveLength(1);
  });
  test("string values pass through without units", () => {
    const expanded = expandKeyframes({ x: ["10%", "50%"] });
    const keyframes = buildWaapiKeyframes(expanded);
    expect(keyframes[0].transform).toContain("translateX(10%)");
    expect(keyframes[1].transform).toContain("translateX(50%)");
  });
});
