import type { ReaderState } from "#src/models/ReaderState";
import type { Region } from "#src/models/Region";

import { clampRegionSize } from "#src/services/clampRegionSize";

// A region's size: the size the reader resized it to, or its default, held between its limits
export const getRegionSize = (region: Region, readerState: ReaderState): number => {
  const storedSize = readerState.regionSizeMap[region.id];
  return clampRegionSize(region, storedSize ?? region.defaultSize);
};
