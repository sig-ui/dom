// @ts-check

/**
 * SigUI DOM animate module for presence.
 * @module
 */
/**
 * removeWithAnimation.
 * @param {*} element
 * @param {*} options
 * @returns {*}
 */
export async function removeWithAnimation(element, options) {
  const controls = options.exit(element);
  await controls.finished;
  element.remove();
}
