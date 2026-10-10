import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { craftingRecipeSchema } from "#src/models/crafting/CraftingRecipe";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The bench's recipes `pnpm -C scripts genshin:assets crafting` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readCraftingRecipes = (gameDataBaseUrl: string): Promise<CraftingRecipe[]> =>
  readGameData(gameDataBaseUrl, "crafting/recipes", z.array(craftingRecipeSchema));
