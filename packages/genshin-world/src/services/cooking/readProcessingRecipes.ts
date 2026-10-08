import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";

import { processingRecipeSchema } from "#src/models/cooking/ProcessingRecipe";
import { z } from "zod";

// The processings, the slice `pnpm -C scripts genshin:assets cooking` writes, imported on demand as a chunk of its own
// And checked against its shape as it arrives
export const readProcessingRecipes = async (): Promise<ProcessingRecipe[]> => {
  const { default: recipes } = await import("#src/generated/cooking/processing.json");
  return z.array(processingRecipeSchema).parse(recipes);
};
