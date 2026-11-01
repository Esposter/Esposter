import { PanzoomZoomDirection } from "#src/models/panzoom/PanzoomZoomDirection";
import { PANZOOM_DEFAULT_STEP } from "#src/services/panzoom/constants";

// The scale a zoom in or out moves to: the scale multiplied by e to the step, or to its negative
export const getPanzoomStepScale = (
  scale: number,
  direction: PanzoomZoomDirection,
  step: number = PANZOOM_DEFAULT_STEP,
): number => {
  const exponent = direction === PanzoomZoomDirection.In ? step : -step;
  return scale * Math.exp(exponent);
};
