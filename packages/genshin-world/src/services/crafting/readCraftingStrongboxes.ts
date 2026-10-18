import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";

import { craftingStrongboxSchema } from "#src/models/crafting/CraftingStrongboxData";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Mystic Offering's strongboxes `pnpm -C scripts genshin:assets crafting` publishes
// Fetched by their key from the hosted game data and checked against their shape as they arrive
export const readCraftingStrongboxes = (gameDataBaseUrl: string): Promise<CraftingStrongboxData[]> =>
  readGameData(gameDataBaseUrl, "crafting/strongboxes", z.array(craftingStrongboxSchema));
