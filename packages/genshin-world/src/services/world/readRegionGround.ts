import type { RegionGround } from "#src/models/world/RegionGround";

import { GameDataset } from "#src/models/data/GameDataset";
import { regionGroundSchema } from "#src/models/world/RegionGround";
import { readGameData } from "#src/services/data/readGameData";
import { REGION_GROUND_KEYS } from "#src/services/world/constants";

// A region's ground laid over Windrise's, read with the region's data as it comes within reach, so a region out of reach
// Reads none. A region that lays no ground of its own over Windrise's, as Mondstadt does not, reads none
export const readRegionGround = (gameDataBaseUrl: string, id: string): Promise<RegionGround | undefined> => {
  const groundKey = REGION_GROUND_KEYS.find((key) => key === `${GameDataset.Ground}/${id}`);
  if (groundKey === undefined) return Promise.resolve(undefined);
  return readGameData(gameDataBaseUrl, groundKey, regionGroundSchema);
};
