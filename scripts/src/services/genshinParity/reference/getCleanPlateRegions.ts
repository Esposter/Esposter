import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { checkIsWholeFrameCovered } from "#src/services/genshinParity/reference/checkIsWholeFrameCovered";

// The regions a backdrop's clean plate fills, or undefined when the entry draws no clean plate: a screen that is not a
// backdrop, or one whose regions cover the whole frame, has no border to fill from
export const getCleanPlateRegions = (
  reference: ParityReference,
  dimensions: { height: number; width: number },
): ImageRegion[] | undefined => {
  if (!reference.isBackdrop) return undefined;
  const regions = reference.plate ?? [reference.region ?? { ...dimensions, x: 0, y: 0 }];
  return checkIsWholeFrameCovered(regions, dimensions) ? undefined : regions;
};
