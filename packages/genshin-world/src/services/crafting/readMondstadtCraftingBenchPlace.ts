import type { CraftingBenchPlace } from "#src/models/crafting/CraftingBenchPlace";

import { craftingBenchPlaceSchema } from "#src/models/crafting/CraftingBenchPlace";
import { readGameData } from "#src/services/data/readGameData";

// Mondstadt's crafting bench place `pnpm -C scripts genshin:assets crafting` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readMondstadtCraftingBenchPlace = (gameDataBaseUrl: string): Promise<CraftingBenchPlace> =>
  readGameData(gameDataBaseUrl, "craftingBenchPlaces/mondstadt", craftingBenchPlaceSchema);
