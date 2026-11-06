import type { ReaderState } from "#src/models/ReaderState";
import type { Region } from "#src/models/Region";
import type { RegionPlacement } from "#src/models/RegionPlacement";
import type { SizeClass } from "#src/models/SizeClass";

import { checkIsRegionOpen } from "#src/services/checkIsRegionOpen";
import { getRegionEdge } from "#src/services/getRegionEdge";

// Where a region is drawn for a size class: at the edge that class names, presented as that class presents it, and open or closed
export const presentRegion = (region: Region, sizeClass: SizeClass, readerState: ReaderState): RegionPlacement => {
  const edge = getRegionEdge(region, sizeClass);
  const presentation = region.sizeClassPresentationMap[sizeClass];
  const isOpen = checkIsRegionOpen(region, presentation, readerState);
  return { edge, isOpen, presentation };
};
