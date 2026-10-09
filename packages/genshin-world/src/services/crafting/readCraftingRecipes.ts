import type { CraftingRecipe } from "#src/models/crafting/CraftingRecipe";

import { craftingRecipeSchema } from "#src/models/crafting/CraftingRecipe";
import { z } from "zod";

// The bench's recipes, the slice `pnpm -C scripts genshin:assets crafting` writes, imported on demand as a chunk of its
// Own and checked against its shape as it arrives
export const readCraftingRecipes = async (): Promise<CraftingRecipe[]> => {
  const { default: recipes } = await import("#src/generated/crafting/recipes.json");
  return z.array(craftingRecipeSchema).parse(recipes);
};
