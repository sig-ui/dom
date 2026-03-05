// @ts-check

/**
 * SigUI DOM data viz module for data viz.
 * @module
 */
import { toOklch, interpolateColor, simulateCVD, deltaEOK } from "@sig-ui/core";
import { normalizeHue } from "../../core/src/utils.js";
/**
 * getCategoricalPalette.
 * @param {*} dataColors
 * @param {*} ramps
 * @param {*} count
 * @param {*} options
 * @returns {*}
 */
export function getCategoricalPalette(dataColors, ramps, count, options = {}) {
  const { cvdSafe = true } = options;
  const result = [];
  for (let i = 0;i < Math.min(count, dataColors.length); i++) {
    const ref = dataColors[i];
    const match = /^(.+?)@(\d+)$/.exec(ref);
    if (match) {
      const ramp = ramps[match[1]];
      const shade = parseInt(match[2], 10);
      if (ramp?.[shade]) {
        result.push(ramp[shade]);
        continue;
      }
    }
    result.push(toOklch(ref));
  }
  if (count > result.length) {
    const remaining = count - result.length;
    for (let i = 0;i < remaining; i++) {
      const t = (result.length + i) / count;
      const hue = perceptualHue(t);
      result.push({ l: 0.6, c: 0.15, h: hue, alpha: 1 });
    }
  }
  if (cvdSafe && result.length > 1) {
    adjustForCvd(result);
  }
  return result.slice(0, count);
}
function perceptualHue(t) {
  const warpedT = t + 0.03 * Math.sin(2 * Math.PI * t) - 0.02 * Math.sin(4 * Math.PI * t);
  return normalizeHue(warpedT * 360);
}
/**
 * getSequentialScale.
 * @param {*} startColor
 * @param {*} endColor
 * @param {*} steps
 * @returns {*}
 */
export function getSequentialScale(startColor, endColor, steps) {
  const result = [];
  for (let i = 0;i < steps; i++) {
    const t = steps === 1 ? 0.5 : i / (steps - 1);
    result.push(interpolateColor(startColor, endColor, t));
  }
  return result;
}
/**
 * getDivergingScale.
 * @param {*} startColor
 * @param {*} endColor
 * @param {*} steps
 * @returns {*}
 */
export function getDivergingScale(startColor, endColor, steps) {
  const mid = Math.floor(steps / 2);
  const start = typeof startColor === "string" ? toOklch(startColor) : startColor;
  const end = typeof endColor === "string" ? toOklch(endColor) : endColor;
  const neutral = {
    l: (start.l + end.l) / 2,
    c: 0.01,
    h: 0,
    alpha: 1
  };
  const firstHalf = getSequentialScale(start, neutral, mid + 1);
  const secondHalf = getSequentialScale(neutral, end, steps - mid);
  return [...firstHalf.slice(0, -1), ...secondHalf];
}
function adjustForCvd(colors) {
  const minDelta = 0.05;
  for (let iter = 0;iter < 10; iter++) {
    let worstDelta = 1 / 0;
    let worstI = -1;
    for (let i = 0;i < colors.length; i++) {
      for (let j = i + 1;j < colors.length; j++) {
        for (const type of ["deutan", "protan"]) {
          const sim1 = simulateCVD(colors[i], type, 1);
          const sim2 = simulateCVD(colors[j], type, 1);
          const d = deltaEOK(sim1, sim2);
          if (d < worstDelta) {
            worstDelta = d;
            worstI = j;
          }
        }
      }
    }
    if (worstDelta >= minDelta || worstI === -1)
      break;
    const c = colors[worstI];
    colors[worstI] = { ...c, l: Math.min(1, c.l + 0.05) };
  }
}
