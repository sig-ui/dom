// @ts-check

/**
 * Repository module for sequence.test.
 * @module
 */
import { test, expect, describe } from "bun:test";
import { sequence, timeline } from "../src/animate/sequence.js";
function mockControls(delayMs = 0) {
  let resolveFinished;
  const finished = new Promise((r) => {
    resolveFinished = r;
  });
  if (delayMs === 0) {
    resolveFinished();
  } else {
    setTimeout(() => resolveFinished(), delayMs);
  }
  return {
    play() {},
    pause() {},
    cancel() {
      resolveFinished();
    },
    finish() {
      resolveFinished();
    },
    reverse() {},
    get playbackRate() {
      return 1;
    },
    set playbackRate(_) {},
    finished,
    animations: []
  };
}
describe("sequence", () => {
  test("runs steps in order", async () => {
    const order = [];
    const controls = sequence([
      {
        type: "animate",
        run: () => {
          order.push(1);
          return mockControls();
        }
      },
      {
        type: "animate",
        run: () => {
          order.push(2);
          return mockControls();
        }
      },
      {
        type: "animate",
        run: () => {
          order.push(3);
          return mockControls();
        }
      }
    ]);
    await controls.finished;
    expect(order).toEqual([1, 2, 3]);
  });
  test("empty sequence resolves immediately", async () => {
    const controls = sequence([]);
    await controls.finished;
    expect(true).toBe(true);
  });
  test("cancel stops the chain mid-sequence", async () => {
    const order = [];
    let step2Resolve;
    const step2Promise = new Promise((r) => {
      step2Resolve = r;
    });
    const controls = sequence([
      {
        type: "animate",
        run: () => {
          order.push(1);
          return mockControls();
        }
      },
      {
        type: "animate",
        run: () => {
          order.push(2);
          return {
            play() {},
            pause() {},
            cancel() {
              step2Resolve();
            },
            finish() {
              step2Resolve();
            },
            reverse() {},
            get playbackRate() {
              return 1;
            },
            set playbackRate(_) {},
            finished: step2Promise,
            animations: []
          };
        }
      },
      {
        type: "animate",
        run: () => {
          order.push(3);
          return mockControls();
        }
      }
    ]);
    await new Promise((r) => setTimeout(r, 10));
    controls.cancel();
    await new Promise((r) => setTimeout(r, 50));
    expect(order).toEqual([1, 2]);
  });
  test("delay steps add timing gap", async () => {
    const start = Date.now();
    const controls = sequence([
      { type: "delay", ms: 50 }
    ]);
    await controls.finished;
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(40);
  });
});
describe("timeline builder", () => {
  test("builds and plays a sequence", async () => {
    const order = [];
    const controls = timeline().add(() => {
      order.push("a");
      return mockControls();
    }).add(() => {
      order.push("b");
      return mockControls();
    }).play();
    await controls.finished;
    expect(order).toEqual(["a", "b"]);
  });
  test("supports wait between steps", async () => {
    const order = [];
    const controls = timeline().add(() => {
      order.push("first");
      return mockControls();
    }).wait(10).add(() => {
      order.push("second");
      return mockControls();
    }).play();
    await controls.finished;
    expect(order).toEqual(["first", "second"]);
  });
});
