import type { CookingRecipe } from "#src/models/cooking/CookingRecipe";

import { cookingRecipeSchema } from "#src/models/cooking/CookingRecipe";
import { z } from "zod";

// The dishes, the slice `pnpm -C scripts genshin:assets cooking` writes, imported on demand as a chunk of its own and
// Checked against its shape as it arrives
export const readCookingRecipes = async (): Promise<CookingRecipe[]> => {
  const { default: recipes } = await import("#src/generated/cooking/recipes.json");
  return z.array(cookingRecipeSchema).parse(recipes);
};
