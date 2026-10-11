import type { LoadedRegion } from "#src/models/world/LoadedRegion";

import { readRegionData } from "#src/services/world/readRegionData";
import { readRegionGround } from "#src/services/world/readRegionGround";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";

// A region as it loads in reach: its data as the host serves it beside its ground, then the palettes of the kits its
// Buildings are built by, so each hosted record a region draws with is read only once the region comes within reach.
// Rejected when any of its reads fails
export const readLoadedRegion = async (
  regionDataBaseUrl: string,
  gameDataBaseUrl: string,
  id: string,
): Promise<LoadedRegion> => {
  const [regionData, ground] = await Promise.all([
    readRegionData(regionDataBaseUrl, id),
    readRegionGround(gameDataBaseUrl, id),
  ]);
  const regionPalettes = await readRegionPalettes(gameDataBaseUrl, regionData.landmarks);
  return { ...regionData, ground, regionPalettes };
};
