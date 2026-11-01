import { PanzoomDeltaMode } from "#src/models/panzoom/PanzoomDeltaMode";
import {
  PANZOOM_DEFAULT_STEP,
  PANZOOM_PIXELS_PER_LINE,
  PANZOOM_WHEEL_NOTCH_PIXELS,
  PANZOOM_WHEEL_STEP_DIVISOR,
} from "#src/services/panzoom/constants";

// The scale a wheel event moves to. A notch of PANZOOM_WHEEL_NOTCH_PIXELS is one step, a smaller delta a proportional part
// Of one, and one event moves at most one step. A zero vertical delta takes the horizontal one, as a shift-wheel on a Mac reports it.
// A delta in lines counts PANZOOM_PIXELS_PER_LINE pixels a line, and pages, which browsers report rarely, count as lines
export const getPanzoomWheelScale = (
  scale: number,
  { deltaMode, deltaX, deltaY }: Pick<WheelEvent, "deltaMode" | "deltaX" | "deltaY">,
  step: number = PANZOOM_DEFAULT_STEP,
): number => {
  const delta = deltaY === 0 ? deltaX : deltaY;
  const pixelDelta = deltaMode === PanzoomDeltaMode.Pixel ? delta : delta * PANZOOM_PIXELS_PER_LINE;
  const notchFraction = Math.min(Math.abs(pixelDelta) / PANZOOM_WHEEL_NOTCH_PIXELS, 1);
  const direction = -Math.sign(pixelDelta);
  return scale * Math.exp((direction * step * notchFraction) / PANZOOM_WHEEL_STEP_DIVISOR);
};
