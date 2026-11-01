import type { PanzoomMeasure } from "#src/models/panzoom/PanzoomMeasure";
import type { PanzoomOptions } from "#src/models/panzoom/PanzoomOptions";

import { PanzoomContain } from "#src/models/panzoom/PanzoomContain";
import { PANZOOM_DEFAULT_MAX_SCALE, PANZOOM_DEFAULT_MIN_SCALE } from "#src/services/panzoom/constants";

// Containment is measured against the unscaled size, and an element a pixel or less on a side has none, as upstream's does.
// Inside caps the scale at the one that fits the element in its parent, outside floors it at the one that covers the parent
export const constrainPanzoomScale = (
  scale: number,
  measure: PanzoomMeasure,
  {
    contain,
    maxScale = PANZOOM_DEFAULT_MAX_SCALE,
    minScale = PANZOOM_DEFAULT_MIN_SCALE,
  }: Pick<PanzoomOptions, "contain" | "maxScale" | "minScale">,
): number => {
  const isContainable = measure.size.width > 1 && measure.size.height > 1;
  const widthScale = measure.parent.width / measure.size.width;
  const heightScale = measure.parent.height / measure.size.height;
  const isContainedInside = isContainable && contain === PanzoomContain.Inside;
  const isContainedOutside = isContainable && contain === PanzoomContain.Outside;
  const effectiveMaxScale = isContainedInside ? Math.min(maxScale, widthScale, heightScale) : maxScale;
  const effectiveMinScale = isContainedOutside ? Math.max(minScale, widthScale, heightScale) : minScale;
  return Math.min(Math.max(scale, effectiveMinScale), effectiveMaxScale);
};
