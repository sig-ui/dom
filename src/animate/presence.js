// @ts-check

/**
 * SigUI DOM animate module for presence.
 * @module
 */
/**
 * removeWithAnimation.
 * @param {Element} element
 * @param {{ exit: (element: Element) => { finished: Promise<unknown> } }} options
 * @returns {Promise<void>}
 */
export async function removeWithAnimation(element, options) {
  const controls = options.exit(element);
  await controls.finished;
  element.remove();
}
