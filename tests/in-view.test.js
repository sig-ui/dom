// @ts-check

/**
 * Repository module for in view.test.
 * @module
 */
import { test, expect, describe, beforeEach, afterEach, mock } from "bun:test";
import { inView } from "../src/animate/in-view.js";
let observerCallback;
let observerOptions;
let observedElements;
let disconnected;

class MockIntersectionObserver {
  constructor(callback, options) {
    observerCallback = callback;
    observerOptions = options ?? {};
    observedElements = new Set;
    disconnected = false;
  }
  observe(el) {
    observedElements.add(el);
  }
  unobserve(el) {
    observedElements.delete(el);
  }
  disconnect() {
    disconnected = true;
    observedElements.clear();
  }
}
function makeEntry(target, isIntersecting) {
  return {
    target,
    isIntersecting,
    boundingClientRect: {},
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: {},
    rootBounds: null,
    time: 0
  };
}
let originalIO;
beforeEach(() => {
  originalIO = globalThis.IntersectionObserver;
  globalThis.IntersectionObserver = MockIntersectionObserver;
  disconnected = false;
});
afterEach(() => {
  if (originalIO) {
    globalThis.IntersectionObserver = originalIO;
  } else {
    delete globalThis.IntersectionObserver;
  }
});
function mockElement(id = "el") {
  return { id, classList: { add() {}, remove() {} } };
}
describe("inView", () => {
  test("callback invoked on intersection", () => {
    const el = mockElement();
    let called = false;
    inView(el, () => {
      called = true;
    });
    observerCallback([makeEntry(el, true)], {});
    expect(called).toBe(true);
  });
  test("cleanup function called on viewport exit", () => {
    const el = mockElement();
    let exitCalled = false;
    inView(el, () => {
      return () => {
        exitCalled = true;
      };
    });
    observerCallback([makeEntry(el, true)], {});
    expect(exitCalled).toBe(false);
    observerCallback([makeEntry(el, false)], {});
    expect(exitCalled).toBe(true);
  });
  test("once mode unobserves after first intersection", () => {
    const el = mockElement();
    inView(el, () => {}, { once: true });
    expect(observedElements.has(el)).toBe(true);
    observerCallback([makeEntry(el, true)], {});
    expect(observedElements.has(el)).toBe(false);
  });
  test("returned cleanup disconnects observer", () => {
    const el = mockElement();
    const cleanup = inView(el, () => {});
    expect(disconnected).toBe(false);
    cleanup();
    expect(disconnected).toBe(true);
  });
  test("returned cleanup runs pending exit callbacks", () => {
    const el = mockElement();
    let exitCalled = false;
    const cleanup = inView(el, () => {
      return () => {
        exitCalled = true;
      };
    });
    observerCallback([makeEntry(el, true)], {});
    cleanup();
    expect(exitCalled).toBe(true);
  });
  test("options are passed to IntersectionObserver", () => {
    const el = mockElement();
    inView(el, () => {}, {
      threshold: 0.5,
      rootMargin: "10px"
    });
    expect(observerOptions.threshold).toBe(0.5);
    expect(observerOptions.rootMargin).toBe("10px");
  });
  test("callback without exit function does not error on viewport exit", () => {
    const el = mockElement();
    inView(el, () => {});
    observerCallback([makeEntry(el, true)], {});
    expect(() => {
      observerCallback([makeEntry(el, false)], {});
    }).not.toThrow();
  });
});
