import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";

import { checkIsContainableLength } from "#src/services/panzoom/checkIsContainableLength";

// The scale that fits the element inside its parent's content box on each axis that has a containable side, the lower of the two.
// With no such axis left, nothing limits the fit, and the element keeps its unscaled size
export const getPanzoomFitScale = ({ parent, size }: PanzoomMeasure): number => {
  const fit = Math.min(
    checkIsContainableLength(parent.width) ? parent.width / size.width : Number.POSITIVE_INFINITY,
    checkIsContainableLength(parent.height) ? parent.height / size.height : Number.POSITIVE_INFINITY,
  );
  return Number.isFinite(fit) ? fit : 1;
};
