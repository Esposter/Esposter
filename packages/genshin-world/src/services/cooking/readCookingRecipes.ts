import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { cookingRecipeSchema } from "#src/models/cooking/CookingRecipe";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The dishes `pnpm -C scripts genshin:assets cooking` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readCookingRecipes = (gameDataBaseUrl: string): Promise<CookingRecipe[]> =>
  readGameData(gameDataBaseUrl, "cooking/recipes", z.array(cookingRecipeSchema));
