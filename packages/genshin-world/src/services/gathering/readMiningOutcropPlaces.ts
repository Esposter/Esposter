import type { GatheringPlace } from "#src/models/gathering/GatheringPlace";

import { gatheringPlaceSchema } from "#src/models/gathering/GatheringPlace";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A region's mining outcrop places, fetched by their key from the hosted game data once a publish has written it. A region
// No publish wrote holds no places, so the world draws no outcrop there rather than a read that fails
export const readMiningOutcropPlaces = (gameDataBaseUrl: string, regionId: string): Promise<GatheringPlace[]> => {
  const regionKey = `miningOutcrops/${regionId}`;
  return checkIsGameDataKey(regionKey)
    ? readGameData(gameDataBaseUrl, regionKey, z.array(gatheringPlaceSchema))
    : Promise.resolve([]);
};
