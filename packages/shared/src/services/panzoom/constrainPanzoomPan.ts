import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

import { PANZOOM_DEFAULT_START_SCALE } from "#src/services/panzoom/constants";
import { constrainPanzoomAxis } from "#src/services/panzoom/constrainPanzoomAxis";
import { getPanzoomStartScale } from "#src/services/panzoom/getPanzoomStartScale";

// The pan a call lands on: the requested point, relative to the current pan when asked, with a disabled axis held,
// Then contained at the scale the call moves to, then rounded. A disabled pan holds the current pan unless the call forces it
export const constrainPanzoomPan = (
  current: PanzoomState,
  requested: PanzoomPoint,
  toScale: number,
  measure: PanzoomMeasure,
  {
    contain,
    disablePan,
    disableXAxis,
    disableYAxis,
    force,
    panOnlyWhenZoomed,
    relative,
    roundPixels,
    startScale = PANZOOM_DEFAULT_START_SCALE,
  }: PanzoomPanOptions,
): PanzoomPoint => {
  const startScaleValue = getPanzoomStartScale(startScale, measure);
  const isPanDisabled = disablePan || (panOnlyWhenZoomed && current.scale === startScaleValue);
  if (!force && isPanDisabled) return { x: current.x, y: current.y };

  const offsetX = relative ? current.x : 0;
  const offsetY = relative ? current.y : 0;
  const unconstrainedX = disableXAxis ? current.x : offsetX + requested.x;
  const unconstrainedY = disableYAxis ? current.y : offsetY + requested.y;
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
  const containedX = constrainPanzoomAxis(unconstrainedX, axisX, toScale, contain);
  const containedY = constrainPanzoomAxis(unconstrainedY, axisY, toScale, contain);
  if (!roundPixels) return { x: containedX, y: containedY };

  return { x: Math.round(containedX), y: Math.round(containedY) };
};
