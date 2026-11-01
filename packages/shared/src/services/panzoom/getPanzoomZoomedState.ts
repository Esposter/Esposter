import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";
import type { PanzoomPoint } from "#src/models/panzoom/PanzoomPoint";
import type { PanzoomState } from "#src/models/panzoom/PanzoomState";

import { constrainPanzoomPan } from "#src/services/panzoom/constrainPanzoomPan";
import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { getPanzoomFocalPan } from "#src/services/panzoom/getPanzoomFocalPan";

// The state a zoom lands on. The scale is clamped first, so the focal pan is taken at the scale the zoom reaches. Without a
// Focal point the pan stays where it is, contained at the new scale. The pan is forced and absolute, as a zoom never pans
export const getPanzoomZoomedState = (
  state: PanzoomState,
  measure: PanzoomMeasure,
  options: PanzoomPanOptions,
  scale: number,
  focal?: PanzoomPoint,
): PanzoomState => {
  const toScale = constrainPanzoomScale(scale, measure, options);
  const requested = focal ? getPanzoomFocalPan(state, toScale, focal, measure) : { x: state.x, y: state.y };
  const pan = constrainPanzoomPan(state, requested, toScale, measure, { ...options, force: true, relative: false });

  return { scale: toScale, x: pan.x, y: pan.y };
};
