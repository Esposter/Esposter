import type { ProcessingRecipe } from "#src/models/cooking/ProcessingRecipe";

import { processingRecipeSchema } from "#src/models/cooking/ProcessingRecipe";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The processings `pnpm -C scripts genshin:assets cooking` publishes
// Fetched by its key from the hosted game data and checked against its shape as it arrives
export const readProcessingRecipes = (gameDataBaseUrl: string): Promise<ProcessingRecipe[]> =>
  readGameData(gameDataBaseUrl, "cooking/processing", z.array(processingRecipeSchema));
