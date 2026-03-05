// @ts-check

/**
 * Repository module for svg.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  normalizePath,
  interpolatePath,
  approximatePathLength
} from "@sig-ui/core/motion";
describe("SVG DOM", () => {
  describe("path normalization for morphing", () => {
    test("normalizes to target point count", () => {
      const result = normalizePath("M0,0 L100,0 L100,100", 5);
      expect(result).toContain("M");
      expect(result.match(/L/g)?.length).toBe(4);
    });
  });
  describe("path interpolation for morphing", () => {
    test("at t=0 returns from path", () => {
      const result = interpolatePath("M0,0 L100,0", "M0,0 L0,100", 0);
      expect(result).toBe("M0,0 L100,0");
    });
    test("at t=1 returns to path", () => {
      const result = interpolatePath("M0,0 L100,0", "M0,0 L0,100", 1);
      expect(result).toBe("M0,0 L0,100");
    });
    test("at t=0.5 interpolates midpoint", () => {
      const result = interpolatePath("M0,0 L100,0", "M0,0 L0,100", 0.5);
      expect(result).toBe("M0,0 L50,50");
    });
  });
  describe("path length approximation", () => {
    test("straight horizontal line", () => {
      expect(approximatePathLength("M0,0 L100,0")).toBeCloseTo(100, 5);
    });
    test("3-4-5 right triangle hypotenuse", () => {
      expect(approximatePathLength("M0,0 L30,40")).toBeCloseTo(50, 5);
    });
  });
});
