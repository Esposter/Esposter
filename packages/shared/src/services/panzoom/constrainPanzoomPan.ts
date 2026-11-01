import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

import { constrainPanzoomAxis } from "#src/services/panzoom/constrainPanzoomAxis";
import { getPanzoomStartScale } from "#src/services/panzoom/getPanzoomStartScale";

// The pan a call lands on: the requested point, relative to the current pan when asked, with a disabled axis held, then
// Rounded to whole pixels, then contained at the scale the call moves to, so a rounded pan never sits outside its bounds.
// A disabled pan holds the current pan unless the call forces it
export const constrainPanzoomPan = (
  current: PanzoomState,
  requested: PanzoomPoint,
  toScale: number,
  measure: PanzoomMeasure,
  options: PanzoomPanOptions,
): PanzoomPoint => {
  const { contain, disablePan, disableXAxis, disableYAxis, force, panOnlyWhenZoomed, relative, roundPixels } = options;
  const isPanDisabled = disablePan || (panOnlyWhenZoomed && current.scale === getPanzoomStartScale(measure, options));
  if (!force && isPanDisabled) return { x: current.x, y: current.y };

  const offsetX = relative ? current.x : 0;
  const offsetY = relative ? current.y : 0;
  const unconstrainedX = disableXAxis ? current.x : offsetX + requested.x;
  const unconstrainedY = disableYAxis ? current.y : offsetY + requested.y;
  const roundedX = roundPixels ? Math.round(unconstrainedX) : unconstrainedX;
  const roundedY = roundPixels ? Math.round(unconstrainedY) : unconstrainedY;
  const axisX = {
    center: measure.center.x,
    length: measure.size.width,
    parentLength: measure.parent.width,
    parentStart: measure.parent.left,
  };
  const axisY = {
    center: measure.center.y,
    length: measure.size.height,
    parentLength: measure.parent.height,
    parentStart: measure.parent.top,
  };

  return {
    x: constrainPanzoomAxis(roundedX, axisX, toScale, contain),
    y: constrainPanzoomAxis(roundedY, axisY, toScale, contain),
  };
};
