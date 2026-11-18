import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { ChestPlace } from "#src/models/chest/ChestPlace";

import { GameDataKeys } from "#src/generated/gameDataKeys";
import { chestPlaceSchema } from "#src/models/chest/ChestPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A region's chests, fetched by the key the lock holds for its record as the world opens, and checked against their schema
// As they arrive. A region the lock holds no chest record for has none
export const readRegionChestPlaces = (gameDataBaseUrl: string, regionId: string): Promise<ChestPlace[]> => {
  const key = (GameDataKeys.chests as Partial<Record<string, GameDataKey>>)[regionId];
  return key === undefined ? Promise.resolve([]) : readGameData(gameDataBaseUrl, key, z.array(chestPlaceSchema));
};
