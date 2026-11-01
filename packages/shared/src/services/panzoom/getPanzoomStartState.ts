import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

import { PANZOOM_DEFAULT_START_PAN, PANZOOM_DEFAULT_START_SCALE } from "#src/services/panzoom/constants";
import { constrainPanzoomPan } from "#src/services/panzoom/constrainPanzoomPan";
import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { getPanzoomStartScale } from "#src/services/panzoom/getPanzoomStartScale";

// The state a start or a reset lands on: the start scale clamped and contained, then the start pan contained at that scale.
// The pan is forced and absolute, since a start is never refused by disablePan or read relative to the current pan
export const getPanzoomStartState = (
  state: PanzoomState,
  measure: PanzoomMeasure,
  options: PanzoomPanOptions,
): PanzoomState => {
  const {
    startScale = PANZOOM_DEFAULT_START_SCALE,
    startX = PANZOOM_DEFAULT_START_PAN,
    startY = PANZOOM_DEFAULT_START_PAN,
  } = options;
  const scale = constrainPanzoomScale(getPanzoomStartScale(startScale, measure), measure, options);
  const pan = constrainPanzoomPan(state, { x: startX, y: startY }, scale, measure, {
    ...options,
    force: true,
    relative: false,
  });

  return { scale, x: pan.x, y: pan.y };
};
