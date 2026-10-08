import type { ForgeRecipe } from "#src/models/forging/ForgeRecipe";

import { forgeRecipeSchema } from "#src/models/forging/ForgeRecipe";
import { z } from "zod";

// The blacksmith's recipes, the slice `pnpm -C scripts genshin:assets forging` writes, imported on demand as a chunk of its
// Own and checked against its shape as it arrives
export const readForgeRecipes = async (): Promise<ForgeRecipe[]> => {
  const { default: recipes } = await import("#src/generated/forging/recipes.json");
  return z.array(forgeRecipeSchema).parse(recipes);
};
