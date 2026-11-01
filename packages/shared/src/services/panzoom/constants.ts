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
export const PANZOOM_DEFAULT_OPTIONS: Readonly<PanzoomOptions> = Object.freeze({
  animate: false,
  canvas: false,
  cursor: "move",
  disablePan: false,
  disableXAxis: false,
  disableYAxis: false,
  disableZoom: false,
  duration: 200,
  easing: "ease-in-out",
  excludeClass: "panzoom-exclude",
  maxScale: PANZOOM_DEFAULT_MAX_SCALE,
  minScale: PANZOOM_DEFAULT_MIN_SCALE,
  overflow: "hidden",
  panOnlyWhenZoomed: false,
  pinchAndPan: false,
  relative: false,
  startScale: PANZOOM_DEFAULT_START_SCALE,
  startX: 0,
  startY: 0,
  step: PANZOOM_DEFAULT_STEP,
  touchAction: "none",
} satisfies PanzoomOptions);
