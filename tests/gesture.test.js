// @ts-check

/**
 * Repository module for gesture.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import {
  computeVelocity,
  detectSwipe,
  applyDragConstraint,
  elasticDisplacement
} from "@sig-ui/core/motion";
describe("Gesture DOM", () => {
  describe("velocity computation integration", () => {
    test("computes velocity from pointer-like samples", () => {
      const samples = [
        { point: { x: 0, y: 0 }, time: 900 },
        { point: { x: 50, y: 0 }, time: 950 },
        { point: { x: 100, y: 0 }, time: 1000 }
      ];
      const vel = computeVelocity(samples, 1000);
      expect(vel.x).toBe(1000);
    });
  });
  describe("swipe detection integration", () => {
    test("detects horizontal swipe from velocity + displacement", () => {
      const dir = detectSwipe({ x: -500, y: 50 }, { x: -100, y: 10 });
      expect(dir).toBe("left");
    });
    test("returns null when velocity below threshold", () => {
      const dir = detectSwipe({ x: -100, y: 0 }, { x: -50, y: 0 });
      expect(dir).toBeNull();
    });
  });
  describe("constraint application", () => {
    test("axis lock + bounds work together", () => {
      const result = applyDragConstraint({ x: 200, y: 200 }, { axis: "x", max: { x: 100, y: 100 } });
      expect(result.x).toBe(100);
      expect(result.y).toBe(0);
    });
  });
  describe("elastic overscroll", () => {
    test("small overscroll is nearly proportional", () => {
      const result = elasticDisplacement(5, 100);
      expect(result).toBeGreaterThan(4);
      expect(result).toBeLessThan(5);
    });
    test("large overscroll caps near max", () => {
      const result = elasticDisplacement(500, 100);
      expect(result).toBeGreaterThan(99);
      expect(result).toBeLessThan(100);
    });
  });
});
