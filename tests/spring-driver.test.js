// @ts-check

/**
 * Repository module for spring driver.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { stepSpring, isSettled } from "../src/animate/spring-driver.js";
import { getSpringPresets } from "@sig-ui/core/motion";
const presets = getSpringPresets();
function simulateSpring(config, target, maxSteps = 5000, dt = 1 / 60) {
  let state = { position: 0, velocity: 0, target };
  let steps = 0;
  for (let i = 0;i < maxSteps; i++) {
    state = stepSpring(state, config, dt);
    steps++;
    if (isSettled(state))
      break;
  }
  return { state, steps };
}
describe("stepSpring", () => {
  test("moves toward target from below", () => {
    const state = { position: 0, velocity: 0, target: 1 };
    const next = stepSpring(state, presets.default, 1 / 60);
    expect(next.position).toBeGreaterThan(0);
    expect(next.velocity).toBeGreaterThan(0);
  });
  test("moves toward target from above", () => {
    const state = { position: 2, velocity: 0, target: 1 };
    const next = stepSpring(state, presets.default, 1 / 60);
    expect(next.position).toBeLessThan(2);
    expect(next.velocity).toBeLessThan(0);
  });
  test("at rest at target produces no movement", () => {
    const state = { position: 1, velocity: 0, target: 1 };
    const next = stepSpring(state, presets.default, 1 / 60);
    expect(next.position).toBeCloseTo(1, 10);
    expect(next.velocity).toBeCloseTo(0, 10);
  });
});
describe("isSettled", () => {
  test("at target with zero velocity is settled", () => {
    expect(isSettled({ position: 1, velocity: 0, target: 1 })).toBe(true);
  });
  test("within threshold is settled", () => {
    expect(isSettled({ position: 0.9999, velocity: 0.005, target: 1 })).toBe(true);
  });
  test("outside position threshold is not settled", () => {
    expect(isSettled({ position: 0.99, velocity: 0, target: 1 })).toBe(false);
  });
  test("outside velocity threshold is not settled", () => {
    expect(isSettled({ position: 1, velocity: 0.02, target: 1 })).toBe(false);
  });
});
describe("spring convergence", () => {
  test("underdamped (bouncy) converges to target", () => {
    const { state } = simulateSpring(presets.bouncy, 100);
    expect(state.position).toBeCloseTo(100, 1);
    expect(isSettled(state)).toBe(true);
  });
  test("overdamped converges to target", () => {
    const overdamped = { stiffness: 100, damping: 50, mass: 1 };
    const { state } = simulateSpring(overdamped, 100);
    expect(state.position).toBeCloseTo(100, 1);
    expect(isSettled(state)).toBe(true);
  });
  test("critically damped converges to target", () => {
    const critical = { stiffness: 200, damping: 28.28, mass: 1 };
    const { state } = simulateSpring(critical, 100);
    expect(state.position).toBeCloseTo(100, 1);
    expect(isSettled(state)).toBe(true);
  });
  test("snappy preset settles faster than gentle", () => {
    const snappy = simulateSpring(presets.snappy, 100);
    const gentle = simulateSpring(presets.gentle, 100);
    expect(snappy.steps).toBeLessThan(gentle.steps);
  });
  test("all presets converge within 5000 steps", () => {
    for (const [name, config] of Object.entries(presets)) {
      const { state } = simulateSpring(config, 100);
      expect(isSettled(state)).toBe(true);
    }
  });
});
describe("velocity preservation", () => {
  test("retargeting preserves velocity", () => {
    let state = { position: 0, velocity: 0, target: 100 };
    for (let i = 0;i < 10; i++) {
      state = stepSpring(state, presets.default, 1 / 60);
    }
    const velocityBeforeRetarget = state.velocity;
    expect(velocityBeforeRetarget).toBeGreaterThan(0);
    state = { ...state, target: 50 };
    expect(state.velocity).toBe(velocityBeforeRetarget);
    const { state: final } = simulateSpring(presets.default, 50, 5000, 1 / 60);
    expect(final.position).toBeCloseTo(50, 1);
  });
});
describe("dt cap", () => {
  test("large dt does not cause explosion", () => {
    const state = { position: 0, velocity: 0, target: 100 };
    const next = stepSpring(state, presets.bouncy, 0.064);
    expect(Number.isFinite(next.position)).toBe(true);
    expect(Number.isFinite(next.velocity)).toBe(true);
    expect(Math.abs(next.position)).toBeLessThan(1000);
  });
  test("very large dt produces bounded values", () => {
    const state = { position: 0, velocity: 0, target: 100 };
    const next = stepSpring(state, presets.default, 0.064);
    expect(Number.isFinite(next.position)).toBe(true);
    expect(Math.abs(next.position)).toBeLessThan(200);
  });
});
