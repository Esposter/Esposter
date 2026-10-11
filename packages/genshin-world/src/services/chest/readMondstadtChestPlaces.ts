import type { ChestPlace } from "#src/models/chest/ChestPlace";

import { chestPlaceSchema } from "#src/models/chest/ChestPlace";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Mondstadt's chests, fetched by their key from the hosted game data as the world opens, and checked against their schema
// As they arrive
export const readMondstadtChestPlaces = (gameDataBaseUrl: string): Promise<ChestPlace[]> =>
  readGameData(gameDataBaseUrl, "chests/mondstadt", z.array(chestPlaceSchema));
