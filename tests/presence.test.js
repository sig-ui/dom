// @ts-check

/**
 * Repository module for presence.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { removeWithAnimation } from "../src/animate/presence.js";
describe("removeWithAnimation", () => {
  test("calls exit factory with the element", async () => {
    let receivedElement = null;
    const el = {
      remove() {}
    };
    const mockControls = {
      play() {},
      pause() {},
      cancel() {},
      finish() {},
      reverse() {},
      get playbackRate() {
        return 1;
      },
      set playbackRate(_) {},
      finished: Promise.resolve(),
      animations: []
    };
    await removeWithAnimation(el, {
      exit: (element) => {
        receivedElement = element;
        return mockControls;
      }
    });
    expect(receivedElement).toBe(el);
  });
  test("removes element after animation finishes", async () => {
    let removed = false;
    const el = {
      remove() {
        removed = true;
      }
    };
    let resolveAnim;
    const animFinished = new Promise((r) => {
      resolveAnim = r;
    });
    const mockControls = {
      play() {},
      pause() {},
      cancel() {},
      finish() {},
      reverse() {},
      get playbackRate() {
        return 1;
      },
      set playbackRate(_) {},
      finished: animFinished,
      animations: []
    };
    const promise = removeWithAnimation(el, {
      exit: () => {
        setTimeout(() => resolveAnim(), 10);
        return mockControls;
      }
    });
    expect(removed).toBe(false);
    await promise;
    expect(removed).toBe(true);
  });
  test("works with spring controls", async () => {
    let removed = false;
    const el = {
      remove() {
        removed = true;
      }
    };
    const mockSpring = {
      stop() {},
      setTarget() {},
      finished: Promise.resolve()
    };
    await removeWithAnimation(el, {
      exit: () => mockSpring
    });
    expect(removed).toBe(true);
  });
});
