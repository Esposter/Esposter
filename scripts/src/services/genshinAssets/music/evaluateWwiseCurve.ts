import type { WwiseCurve } from "#src/models/genshinAssets/music/WwiseCurve";

import { WwiseCurveInterpolation } from "#src/models/genshinAssets/music/WwiseCurveInterpolation";
import { WwiseCurveScaling } from "#src/models/genshinAssets/music/WwiseCurveScaling";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The level Wwise mutes a property at, in decibels, where a curve's stored amplitude reaches its floor
const MUTED_DECIBELS = -96.3;
// A curve's property at a game parameter's value: held at its end points past them, eased between the two points around
// It in the curve's stored values, then scaled into the property's unit, as Wwise's conversion table applies it. Only
// The easings volume curves use are read, and a pair of points at one value eases to that value whatever its shape
export const evaluateWwiseCurve = ({ points, scaling }: WwiseCurve, value: number): number => {
  const nextIndex = points.findIndex(({ from }) => from > value);
  let stored: number;
  if (nextIndex === 0) stored = takeOne(points, 0).to;
  else if (nextIndex === -1) stored = takeOne(points, points.length - 1).to;
  else {
    const previous = takeOne(points, nextIndex - 1);
    const next = takeOne(points, nextIndex);
    if (previous.to === next.to || previous.interpolation === WwiseCurveInterpolation.Constant) stored = previous.to;
    else if (previous.interpolation === WwiseCurveInterpolation.Linear)
      stored = previous.to + ((value - previous.from) / (next.from - previous.from)) * (next.to - previous.to);
    else throw new InvalidOperationError(Operation.Read, String(previous.interpolation), "is an easing not read");
  }
  if (scaling === WwiseCurveScaling.None) return stored;
  const amplitude = Math.min(Math.max(stored, -1), 1) + 1;
  return amplitude === 0 ? MUTED_DECIBELS : 20 * Math.log10(amplitude);
};
