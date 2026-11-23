import type { LoadedRegion } from "#src/models/world/LoadedRegion";

import { readRegionOfferingLandmarks } from "#src/services/offering/readRegionOfferingLandmarks";
import { readRegionData } from "#src/services/world/readRegionData";
import { readRegionPalettes } from "#src/services/world/readRegionPalettes";
import { readRegionRockLandmarks } from "#src/services/world/readRegionRockLandmarks";

// A region as it loads in reach: its data as the host serves it, then the palettes of the kits its buildings are built
// By, And the hosted rocks and offerings its landmarks take, so each hosted record a region draws with is read only
// Once the Region comes within reach. Its ground pieces are read by their own areas' reach, not here. Rejected when any
// Of its reads fails
export const readLoadedRegion = async (
  regionDataBaseUrl: string,
  gameDataBaseUrl: string,
  id: string,
): Promise<LoadedRegion> => {
  const regionData = await readRegionData(regionDataBaseUrl, id);
  const [regionPalettes, rockLandmarks, offeringLandmarks] = await Promise.all([
    readRegionPalettes(gameDataBaseUrl, regionData.landmarks),
    readRegionRockLandmarks(gameDataBaseUrl, id),
    readRegionOfferingLandmarks(gameDataBaseUrl, id),
  ]);
  return {
    ...regionData,
    landmarks: [...regionData.landmarks, ...rockLandmarks, ...offeringLandmarks],
    regionPalettes,
  };
};
