import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { forgeRecipeSchema } from "#src/models/forging/ForgeRecipe";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The blacksmith's recipes `pnpm -C scripts genshin:assets forging` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readForgeRecipes = (gameDataBaseUrl: string): Promise<ForgeRecipe[]> =>
  readGameData(gameDataBaseUrl, "forging/recipes", z.array(forgeRecipeSchema));
