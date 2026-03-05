// @ts-check

/**
 * Repository module for scroll.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { mapRange } from "../src/animate/scroll.js";
describe("Scroll Progress", () => {
  describe("mapRange", () => {
    test("maps 0 from [0,1] to [0,100]", () => {
      expect(mapRange(0, 0, 1, 0, 100)).toBe(0);
    });
    test("maps 1 from [0,1] to [0,100]", () => {
      expect(mapRange(1, 0, 1, 0, 100)).toBe(100);
    });
    test("maps 0.5 from [0,1] to [0,100]", () => {
      expect(mapRange(0.5, 0, 1, 0, 100)).toBe(50);
    });
    test("maps across arbitrary ranges", () => {
      expect(mapRange(50, 0, 100, 200, 400)).toBe(300);
    });
    test("clamps below input minimum", () => {
      expect(mapRange(-1, 0, 1, 0, 100)).toBe(0);
    });
    test("clamps above input maximum", () => {
      expect(mapRange(2, 0, 1, 0, 100)).toBe(100);
    });
    test("handles inverted output range", () => {
      expect(mapRange(0.5, 0, 1, 100, 0)).toBe(50);
    });
    test("handles equal input min/max", () => {
      expect(mapRange(5, 5, 5, 0, 100)).toBe(0);
    });
    test("maps full range correctly", () => {
      expect(mapRange(0, 0, 1, -50, 50)).toBe(-50);
      expect(mapRange(0.5, 0, 1, -50, 50)).toBe(0);
      expect(mapRange(1, 0, 1, -50, 50)).toBe(50);
    });
  });
});
