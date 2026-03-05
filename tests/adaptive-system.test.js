// @ts-check

/**
 * Repository module for adaptive system.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { setupAdaptiveSystem } from "../src/adaptive-system.js";
import { DEFAULT_DEVICE_CONTEXT } from "@sig-ui/core";
describe("setupAdaptiveSystem (non-browser)", () => {
  test("returns handle with DEFAULT_DEVICE_CONTEXT in SSR", () => {
    const handle = setupAdaptiveSystem();
    expect(handle.context).toEqual(DEFAULT_DEVICE_CONTEXT);
  });
  test("returns null theme when no config provided", () => {
    const handle = setupAdaptiveSystem();
    expect(handle.theme).toBeNull();
  });
  test("resolves theme when config is provided", () => {
    const handle = setupAdaptiveSystem({
      config: { brand: "#6366f1" }
    });
    expect(handle.theme).not.toBeNull();
    expect(handle.theme.palettes).toBeDefined();
  });
  test("destroy does not throw in SSR", () => {
    const handle = setupAdaptiveSystem();
    expect(() => handle.destroy()).not.toThrow();
  });
  test("refresh does not throw in SSR", () => {
    const handle = setupAdaptiveSystem();
    expect(() => handle.refresh()).not.toThrow();
  });
  test("double destroy does not throw", () => {
    const handle = setupAdaptiveSystem();
    handle.destroy();
    expect(() => handle.destroy()).not.toThrow();
  });
});
