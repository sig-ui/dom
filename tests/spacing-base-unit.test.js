// @ts-check

/**
 * Repository module for spacing base unit.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { readBaseUnit } from "../src/spacing/base-unit.js";
describe("readBaseUnit", () => {
  test("returns default 4 in non-browser environment", () => {
    expect(readBaseUnit()).toBe(4);
  });
  test("returns default 4 when called without element in non-browser env", () => {
    const result = readBaseUnit(undefined);
    expect(result).toBe(4);
  });
  test("returns a number", () => {
    expect(typeof readBaseUnit()).toBe("number");
  });
});
