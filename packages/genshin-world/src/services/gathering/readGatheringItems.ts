import type { GatheringItem } from "#src/models/gathering/GatheringItem";

import { gatheringItemSchema } from "#src/models/gathering/GatheringItem";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The plants and specialties the gathering points give, fetched by their key from the hosted game data and checked
// Against their schema as they arrive
export const readGatheringItems = (gameDataBaseUrl: string): Promise<GatheringItem[]> =>
  readGameData(gameDataBaseUrl, "gathering/items", z.array(gatheringItemSchema));
