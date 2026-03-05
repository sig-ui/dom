// @ts-check

/**
 * SigUI DOM animate module for index.
 * @module
 */
export { animate, wrapAnimations } from "./animate.js";
export { spring, stepSpring, isSettled } from "./spring-driver.js";
export { inView } from "./in-view.js";
export { stagger, staggerEased } from "./stagger.js";
export { resolveElements } from "./elements.js";
export { applyTransformStyles } from "./apply-styles.js";
export { flipSnapshot, flipAnimate, flip } from "./flip.js";
export { createLayoutIdRegistry } from "./layout-id.js";
export { drag, swipe } from "./gesture.js";
export { sequence, timeline } from "./sequence.js";
export { removeWithAnimation } from "./presence.js";
export { drawStroke, morphPath } from "./svg.js";
export { onScroll, onScrollView, mapRange } from "./scroll.js";
export { resolveEasingTuple } from "./resolve.js";
