import type { ReaderState } from "#src/models/ReaderState";
import type { Region } from "#src/models/Region";

import { clampRegionSize } from "#src/services/clampRegionSize";

// The state with a region sized to the size asked for, held between its limits. The given state is left as it was
export const resizeRegion = (region: Region, readerState: ReaderState, size: number): ReaderState => {
  const clampedSize = clampRegionSize(region, size);
  return { ...readerState, regionSizeMap: { ...readerState.regionSizeMap, [region.id]: clampedSize } };
};
