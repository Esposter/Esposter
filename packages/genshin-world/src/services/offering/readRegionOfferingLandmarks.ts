import type { OfferingLandmark } from "#src/models/world/OfferingLandmark";

import { offeringPlaceRecordSchema } from "#src/models/offering/OfferingPlaceRecord";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A region's offerings as the landmarks the world stands them as: each place `pnpm -C scripts genshin:assets offerings`
// Publishes for the region, read by the key the lock holds for it as the region comes within reach. A region the lock
// Holds no places for has none
export const readRegionOfferingLandmarks = async (
  gameDataBaseUrl: string,
  regionId: string,
): Promise<OfferingLandmark[]> => {
  const key = `offeringPlaces/${regionId}`;
  if (!checkIsGameDataKey(key)) return [];
  const places = await readGameData(gameDataBaseUrl, key, z.array(offeringPlaceRecordSchema));
  return places.map(({ id, kind, position }) => ({ id, kind: LandmarkKind.Offering, offeringKind: kind, position }));
};
