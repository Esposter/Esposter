import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

// The scale and step defaults the core reads, each named once so the default options and the core share the value
export const PANZOOM_DEFAULT_MAX_SCALE = 4;
export const PANZOOM_DEFAULT_MIN_SCALE = 0.125;
export const PANZOOM_DEFAULT_START_SCALE = 1;
export const PANZOOM_DEFAULT_STEP = 0.3;
// A wheel notch moves the scale by the step divided by this
export const PANZOOM_WHEEL_STEP_DIVISOR = 3;
// The pixel delta of one wheel notch, which is one whole step
export const PANZOOM_WHEEL_NOTCH_PIXELS = 100;
// A wheel delta reported in lines counts this many pixels per line
export const PANZOOM_PIXELS_PER_LINE = 16;
// The defaults the shell reads, each named once so the default options and the shell share the value
export const PANZOOM_DEFAULT_CURSOR = "move";
export const PANZOOM_DEFAULT_DURATION = 200;
export const PANZOOM_DEFAULT_EASING = "ease-in-out";
export const PANZOOM_DEFAULT_EXCLUDE_CLASS = "panzoom-exclude";
export const PANZOOM_DEFAULT_OVERFLOW = "hidden";
export const PANZOOM_DEFAULT_PAN_THRESHOLD = 0;
export const PANZOOM_DEFAULT_START_PAN = 0;
export const PANZOOM_DEFAULT_TOUCH_ACTION = "none";
export const PANZOOM_DEFAULT_TRANSFORM_ORIGIN = "50% 50%";
export const PANZOOM_SVG_NAMESPACE = "http://www.w3.org/2000/svg";
export const PANZOOM_DEFAULT_OPTIONS: Readonly<PanzoomOptions> = Object.freeze({
  animate: false,
  canvas: false,
  cursor: PANZOOM_DEFAULT_CURSOR,
  disablePan: false,
  disableXAxis: false,
  disableYAxis: false,
  disableZoom: false,
  duration: PANZOOM_DEFAULT_DURATION,
  easing: PANZOOM_DEFAULT_EASING,
  excludeClass: PANZOOM_DEFAULT_EXCLUDE_CLASS,
  maxScale: PANZOOM_DEFAULT_MAX_SCALE,
  minScale: PANZOOM_DEFAULT_MIN_SCALE,
  overflow: PANZOOM_DEFAULT_OVERFLOW,
  panOnlyWhenZoomed: false,
  panThreshold: PANZOOM_DEFAULT_PAN_THRESHOLD,
  pinchAndPan: false,
  relative: false,
  startScale: PANZOOM_DEFAULT_START_SCALE,
  startX: PANZOOM_DEFAULT_START_PAN,
  startY: PANZOOM_DEFAULT_START_PAN,
  step: PANZOOM_DEFAULT_STEP,
  touchAction: PANZOOM_DEFAULT_TOUCH_ACTION,
} satisfies PanzoomOptions);
