import type { CompoundRow } from "#src/models/genshinAssets/cooking/CompoundRow";

import { COMPOUND_TABLE_NAME } from "#src/services/genshinAssets/cooking/constants";
import { toProcessingRecipe } from "#src/services/genshinAssets/cooking/toProcessingRecipe";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The processings from the game's compound table, the ingredients into one result over time, sorted by id as the
// Processing record of the cooking dataset
export const buildProcessingRecipes = (): Record<string, unknown> => {
  const recipes = readExcelTable<CompoundRow>(COMPOUND_TABLE_NAME)
    .flatMap((row) => {
      const recipe = toProcessingRecipe(row);
      return recipe ? [recipe] : [];
    })
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  return { [`${GameDataset.Cooking}/processing`]: recipes };
};
