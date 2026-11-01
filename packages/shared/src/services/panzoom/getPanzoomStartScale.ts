import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomPanOptions } from "#src/models/panzoom/PanzoomPanOptions";

import { PANZOOM_DEFAULT_START_SCALE } from "#src/services/panzoom/constants";
import { constrainPanzoomScale } from "#src/services/panzoom/constrainPanzoomScale";
import { getPanzoomFitScale } from "#src/services/panzoom/getPanzoomFitScale";

// The scale a start or a reset lands on: the number it names, or the fit when it asks for one, clamped and contained. A pan
// Judged against the start is judged against this same value, so the start state and the pan that is allowed at it agree
export const getPanzoomStartScale = (
  measure: PanzoomMeasure,
  options: Pick<PanzoomPanOptions, "contain" | "maxScale" | "minScale" | "startScale">,
): number => {
  const { startScale = PANZOOM_DEFAULT_START_SCALE } = options;
  const scale = startScale === "fit" ? getPanzoomFitScale(measure) : startScale;
  return constrainPanzoomScale(scale, measure, options);
};
