import type { Region } from "#src/models/Region";

import { clamp } from "@vueuse/core";

// A size held between a region's limits, which a resize and a stored size both pass through
export const clampRegionSize = (region: Region, size: number): number =>
  clamp(size, region.minimumSize, region.maximumSize);
