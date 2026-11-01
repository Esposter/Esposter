import { PANZOOM_DEFAULT_STEP, PANZOOM_PINCH_DISTANCE_PER_STEP } from "#src/services/panzoom/constants";

// The scale a pinch moves to: a finger distance of PANZOOM_PINCH_DISTANCE_PER_STEP pixels multiplies the scale by one
// Plus the step, so a pinch moves the scale at the same rate at any zoom
export const getPanzoomPinchScale = (
  scale: number,
  distanceDelta: number,
  step: number = PANZOOM_DEFAULT_STEP,
): number => scale * (1 + (distanceDelta * step) / PANZOOM_PINCH_DISTANCE_PER_STEP);
