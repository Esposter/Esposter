import { PANZOOM_DEFAULT_STEP, PANZOOM_WHEEL_STEP_DIVISOR } from "#src/services/panzoom/constants";

// The scale a wheel event moves to: a notch is the step divided by PANZOOM_WHEEL_STEP_DIVISOR, zooming in for a negative
// Delta. A zero vertical delta takes the horizontal one, as a shift-wheel on a Mac reports it
export const getPanzoomWheelScale = (
  scale: number,
  deltaX: number,
  deltaY: number,
  step: number = PANZOOM_DEFAULT_STEP,
): number => {
  const delta = deltaY === 0 ? deltaX : deltaY;
  const wheel = delta < 0 ? 1 : -1;
  return scale * Math.exp((wheel * step) / PANZOOM_WHEEL_STEP_DIVISOR);
};
