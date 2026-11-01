import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { checkIsContainableLength } from "#src/services/panzoom/checkIsContainableLength";
import { PANZOOM_DEFAULT_MAX_SCALE, PANZOOM_DEFAULT_MIN_SCALE } from "#src/services/panzoom/constants";
import { getPanzoomCoverScale } from "#src/services/panzoom/getPanzoomCoverScale";
import { getPanzoomFitScale } from "#src/services/panzoom/getPanzoomFitScale";

// Containment is measured against the unscaled size, and an element a pixel or less on a side has none, as upstream's does.
// A parent with no containable side has none either. Inside caps the scale at the fit but not below the minimum, outside
// Floors it at the cover, and automatic floors it at the fit
export const constrainPanzoomScale = (
  scale: number,
  measure: PanzoomMeasure,
  {
    contain,
    maxScale = PANZOOM_DEFAULT_MAX_SCALE,
    minScale = PANZOOM_DEFAULT_MIN_SCALE,
  }: Pick<PanzoomOptions, "contain" | "maxScale" | "minScale">,
): number => {
  const isParentContainable =
    checkIsContainableLength(measure.parent.width) || checkIsContainableLength(measure.parent.height);
  if (!contain || !isParentContainable || measure.size.width <= 1 || measure.size.height <= 1)
    return Math.min(Math.max(scale, minScale), maxScale);

  if (contain === PanzoomContain.Inside) {
    const cap = Math.max(minScale, Math.min(maxScale, getPanzoomFitScale(measure)));
    return Math.min(Math.max(scale, minScale), cap);
  }

  const floor = contain === PanzoomContain.Outside ? getPanzoomCoverScale(measure) : getPanzoomFitScale(measure);
  return Math.min(Math.max(scale, Math.max(minScale, floor)), maxScale);
};
