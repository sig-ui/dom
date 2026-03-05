// @ts-check

/**
 * Repository module for breakpoint.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { watchBreakpoint, getCurrentBreakpoint } from "../src/breakpoint.js";
describe("getCurrentBreakpoint (non-browser)", () => {
  test("returns null in SSR", () => {
    expect(getCurrentBreakpoint()).toBeNull();
  });
});
describe("watchBreakpoint (non-browser)", () => {
  test("returns a cleanup function", () => {
    const cleanup = watchBreakpoint(() => {});
    expect(typeof cleanup).toBe("function");
  });
  test("cleanup does not throw", () => {
    const cleanup = watchBreakpoint(() => {});
    expect(() => cleanup()).not.toThrow();
  });
  test("does not call callback in SSR", () => {
    let called = false;
    watchBreakpoint(() => {
      called = true;
    });
    expect(called).toBe(false);
  });
});
