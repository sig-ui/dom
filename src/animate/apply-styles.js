// @ts-check

/**
 * SigUI DOM animate module for apply styles.
 * @module
 */
/**
 * applyTransformStyles.
 * @param {*} el
 * @param {*} values
 * @returns {*}
 */
export function applyTransformStyles(el, values) {
  const transformParts = [];
  for (const [prop, value] of values) {
    if (prop === "x" || prop === "translateX") {
      transformParts.push(`translateX(${value}px)`);
    } else if (prop === "y" || prop === "translateY") {
      transformParts.push(`translateY(${value}px)`);
    } else if (prop === "scale") {
      transformParts.push(`scale(${value})`);
    } else if (prop === "rotate") {
      transformParts.push(`rotate(${value}deg)`);
    } else if (prop === "opacity") {
      el.style.opacity = String(value);
    } else {
      el.style.setProperty(prop, String(value));
    }
  }
  if (transformParts.length > 0) {
    el.style.transform = transformParts.join(" ");
  }
}
