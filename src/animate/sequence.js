// @ts-check

/**
 * SigUI DOM animate module for sequence.
 * @module
 */
import { resolveDuration } from "./resolve.js";
/**
 * sequence.
 * @param {*} steps
 * @returns {*}
 */
export function sequence(steps) {
  let cancelled = false;
  let currentControls = null;
  let currentTimeout = null;
  const finished = (async () => {
    for (const step of steps) {
      if (cancelled)
        return;
      if (step.type === "delay") {
        const ms = typeof step.ms === "number" ? step.ms : resolveDuration(step.ms);
        await new Promise((resolve) => {
          currentTimeout = setTimeout(() => {
            currentTimeout = null;
            resolve();
          }, ms);
        });
      } else {
        const controls = step.run();
        currentControls = controls;
        await controls.finished;
        currentControls = null;
      }
    }
  })();
  return {
    pause() {
      if (currentControls && "pause" in currentControls) {
        currentControls.pause();
      }
    },
    play() {
      if (currentControls && "play" in currentControls) {
        currentControls.play();
      }
    },
    cancel() {
      cancelled = true;
      if (currentTimeout !== null) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }
      if (currentControls) {
        if ("cancel" in currentControls) {
          currentControls.cancel();
        } else if ("stop" in currentControls) {
          currentControls.stop();
        }
      }
    },
    finished
  };
}
/**
 * timeline.
 * @returns {*}
 */
export function timeline() {
  const steps = [];
  const builder = {
    add(run) {
      steps.push({ type: "animate", run });
      return builder;
    },
    wait(ms) {
      steps.push({ type: "delay", ms });
      return builder;
    },
    play() {
      return sequence(steps);
    }
  };
  return builder;
}
