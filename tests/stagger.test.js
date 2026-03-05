// @ts-check

/**
 * Repository module for stagger.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { stagger } from "../src/animate/stagger.js";
describe("stagger", () => {
  test("basic stagger: index 0 returns 0ms", () => {
    const fn = stagger(50);
    expect(fn(0)).toBe(0);
  });
  test("basic stagger: index 3 returns 150ms at 50ms/item", () => {
    const fn = stagger(50);
    expect(fn(3)).toBe(150);
  });
  test("basic stagger: index 5 returns 500ms at 100ms/item", () => {
    const fn = stagger(100);
    expect(fn(5)).toBe(500);
  });
  test("default delay is 50ms per item", () => {
    const fn = stagger();
    expect(fn(1)).toBe(50);
    expect(fn(2)).toBe(100);
  });
  test("maxItems cap: items beyond max get same delay", () => {
    const fn = stagger(50, { maxItems: 3 });
    expect(fn(2)).toBe(100);
    expect(fn(3)).toBe(150);
    expect(fn(5)).toBe(150);
    expect(fn(100)).toBe(150);
  });
  test("default maxItems is 10", () => {
    const fn = stagger(50);
    expect(fn(10)).toBe(500);
    expect(fn(20)).toBe(500);
  });
  test("metadata: __staggerFrom defaults to 'first'", () => {
    const fn = stagger(50);
    expect(fn.__staggerFrom).toBe("first");
  });
  test("metadata: __staggerFrom is set to 'center'", () => {
    const fn = stagger(50, { from: "center" });
    expect(fn.__staggerFrom).toBe("center");
  });
  test("metadata: __staggerFrom is set to 'last'", () => {
    const fn = stagger(50, { from: "last" });
    expect(fn.__staggerFrom).toBe("last");
  });
  test("metadata: __staggerMaxItems reflects option", () => {
    const fn = stagger(50, { maxItems: 5 });
    expect(fn.__staggerMaxItems).toBe(5);
  });
  test("metadata: default __staggerMaxItems is 10", () => {
    const fn = stagger(50);
    expect(fn.__staggerMaxItems).toBe(10);
  });
});
