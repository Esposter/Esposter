import type { GameDataKey } from "#src/generated/gameDataKeys";
import type { ChestPlace } from "#src/models/chest/ChestPlace";

import { chestPlaceSchema } from "#src/models/chest/ChestPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// A region's chests, fetched by the key the lock holds for its record as the world opens, and checked against their schema
// As they arrive
export const readRegionChestPlaces = (gameDataBaseUrl: string, key: GameDataKey): Promise<ChestPlace[]> =>
  readGameData(gameDataBaseUrl, key, z.array(chestPlaceSchema));
