import type { LoadedRegion } from "#src/models/world/LoadedRegion";

import { readRegionData } from "#src/services/world/readRegionData";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";

// A region as it loads in reach: its data as the host serves it, then the palettes of the kits its buildings are built by,
// So each hosted record a region draws with is read only once the region comes within reach. Its ground pieces are read
// By their own areas' reach, not here. Rejected when any of its reads fails
export const readLoadedRegion = async (
  regionDataBaseUrl: string,
  gameDataBaseUrl: string,
  id: string,
): Promise<LoadedRegion> => {
  const regionData = await readRegionData(regionDataBaseUrl, id);
  const regionPalettes = await readRegionPalettes(gameDataBaseUrl, regionData.landmarks);
  return { ...regionData, regionPalettes };
};
