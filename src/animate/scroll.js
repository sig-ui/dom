// @ts-check

/**
 * SigUI DOM animate module for scroll.
 * @module
 */
/**
 * onScroll.
 * @param {*} callback
 * @param {*} options
 * @returns {*}
 */
export function onScroll(callback, options) {
  const axis = options?.axis ?? "y";
  const source = resolveScrollSource(options?.source);
  if (!source)
    return () => {};
  let lastPosition = 0;
  let lastTime = performance.now();
  let rafPending = false;
  function update() {
    rafPending = false;
    const now = performance.now();
    const position = axis === "y" ? source.scrollTop : source.scrollLeft;
    const maxScroll = axis === "y" ? source.scrollHeight - source.clientHeight : source.scrollWidth - source.clientWidth;
    const progress = maxScroll > 0 ? Math.max(0, Math.min(1, position / maxScroll)) : 0;
    const dt = (now - lastTime) / 1000;
    const velocity = dt > 0 ? (position - lastPosition) / dt : 0;
    lastPosition = position;
    lastTime = now;
    callback({ progress, velocity });
  }
  function onScrollEvent() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }
  const eventTarget = isDocumentScroller(source) ? window : source;
  eventTarget.addEventListener("scroll", onScrollEvent, { passive: true });
  update();
  return () => {
    eventTarget.removeEventListener("scroll", onScrollEvent);
  };
}
/**
 * onScrollView.
 * @param {*} callback
 * @param {*} options
 * @returns {*}
 */
export function onScrollView(callback, options) {
  const targetEl = typeof options.target === "string" ? document.querySelector(options.target) : options.target;
  if (!targetEl)
    return () => {};
  const axis = options.axis ?? "y";
  let isInView = false;
  let rafPending = false;
  let lastPosition = 0;
  let lastTime = performance.now();
  function computeProgress() {
    const rect = targetEl.getBoundingClientRect();
    const viewport = axis === "y" ? window.innerHeight : window.innerWidth;
    const pos = axis === "y" ? rect.top : rect.left;
    const size = axis === "y" ? rect.height : rect.width;
    const totalRange = viewport + size;
    if (totalRange <= 0)
      return 0;
    const progress = (viewport - pos) / totalRange;
    return Math.max(0, Math.min(1, progress));
  }
  function update() {
    rafPending = false;
    if (!isInView)
      return;
    const now = performance.now();
    const progress = computeProgress();
    const dt = (now - lastTime) / 1000;
    const velocity = dt > 0 ? (progress - lastPosition) / dt : 0;
    lastPosition = progress;
    lastTime = now;
    callback({ progress, velocity });
  }
  function onScrollEvent() {
    if (!rafPending && isInView) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      isInView = entry.isIntersecting;
      if (isInView) {
        update();
      }
    }
  }, { threshold: 0 });
  observer.observe(targetEl);
  window.addEventListener("scroll", onScrollEvent, { passive: true });
  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", onScrollEvent);
  };
}
/**
 * mapRange.
 * @param {*} value
 * @param {*} inputMin
 * @param {*} inputMax
 * @param {*} outputMin
 * @param {*} outputMax
 * @returns {*}
 */
export function mapRange(value, inputMin, inputMax, outputMin, outputMax) {
  if (inputMax === inputMin)
    return outputMin;
  const t = (value - inputMin) / (inputMax - inputMin);
  const clamped = Math.max(0, Math.min(1, t));
  return outputMin + clamped * (outputMax - outputMin);
}
function resolveScrollSource(source) {
  if (!source) {
    return typeof document !== "undefined" ? document.scrollingElement ?? document.documentElement : null;
  }
  if (typeof source === "string") {
    return document.querySelector(source);
  }
  return source;
}
function isDocumentScroller(el) {
  if (!el || typeof document === "undefined")
    return false;
  return el === document.documentElement || el === document.body;
}
