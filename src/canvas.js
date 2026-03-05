// @ts-check

/**
 * SigUI DOM canvas module for canvas.
 * @module
 */
/**
 * applyToCanvas.
 * @param {*} manager
 * @returns {*}
 */
export function applyToCanvas(manager) {
  return {
    getColor(name, format = "hex") {
      const hex = manager.getColor(name, { format: "hex" });
      if (format === "rgb")
        return hexToRgb(hex);
      return hex;
    },
    getDataPalette(count) {
      return manager.getCategoricalPalette(count, { format: "hex" });
    },
    get mode() {
      return manager.mode;
    }
  };
}
function hexToRgb(hex) {
  if (!hex.startsWith("#") || hex.length < 7)
    return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}
