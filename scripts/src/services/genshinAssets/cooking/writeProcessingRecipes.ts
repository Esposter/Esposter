import type { CompoundRow } from "#src/models/genshinAssets/cooking/CompoundRow";

import {
  COMPOUND_TABLE_NAME,
  COOKING_GENERATED_DIRECTORY,
  PROCESSING_RECIPES_PATH,
} from "#src/services/genshinAssets/cooking/constants";
import { toProcessingRecipe } from "#src/services/genshinAssets/cooking/toProcessingRecipe";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";

// The processings from the game's compound table, the ingredients into one result over time, written as one slice in the
// World's generated folder, by id
export const writeProcessingRecipes = (): void => {
  const recipes = readExcelTable<CompoundRow>(COMPOUND_TABLE_NAME)
    .flatMap((row) => {
      const recipe = toProcessingRecipe(row);
      return recipe ? [recipe] : [];
    })
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  mkdirSync(COOKING_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(PROCESSING_RECIPES_PATH, recipes);
};
