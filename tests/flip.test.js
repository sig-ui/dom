// @ts-check

/**
 * Repository module for flip.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { computeFlipInversion, FLIP_THRESHOLD_PX } from "@sig-ui/core/motion";
import { wrapAnimations } from "../src/animate/animate.js";
describe("FLIP DOM", () => {
  describe("wrapAnimations", () => {
    test("wraps empty array with resolved finished promise", async () => {
      const controls = wrapAnimations([]);
      expect(controls.animations).toHaveLength(0);
      expect(controls.playbackRate).toBe(1);
      await controls.finished;
    });
    test("exposes play/pause/cancel/finish/reverse methods", () => {
      const controls = wrapAnimations([]);
      expect(typeof controls.play).toBe("function");
      expect(typeof controls.pause).toBe("function");
      expect(typeof controls.cancel).toBe("function");
      expect(typeof controls.finish).toBe("function");
      expect(typeof controls.reverse).toBe("function");
    });
  });
  describe("FLIP inversion integration", () => {
    test("identity inversion produces no animation", () => {
      const rect = { x: 10, y: 20, width: 100, height: 50 };
      const inv = computeFlipInversion(rect, rect);
      expect(inv.isIdentity).toBe(true);
      const controls = wrapAnimations([]);
      expect(controls.animations).toHaveLength(0);
    });
    test("non-identity inversion produces animation values", () => {
      const first = { x: 0, y: 0, width: 100, height: 100 };
      const last = { x: 50, y: 50, width: 200, height: 200 };
      const inv = computeFlipInversion(first, last);
      expect(inv.isIdentity).toBe(false);
      expect(inv.x).toBe(-50);
      expect(inv.y).toBe(-50);
      expect(inv.scaleX).toBe(0.5);
      expect(inv.scaleY).toBe(0.5);
    });
  });
});
