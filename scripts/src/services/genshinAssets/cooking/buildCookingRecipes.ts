import type { CookBonusRow } from "#src/models/genshinAssets/cooking/CookBonusRow";
import type { CookRecipeRow } from "#src/models/genshinAssets/cooking/CookRecipeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  COOK_BONUS_TABLE_NAME,
  COOK_RECIPE_TABLE_NAME,
  UNLOCK_COOK_RECIPE_USE_OP,
} from "#src/services/genshinAssets/cooking/constants";
import { toCookingRecipe } from "#src/services/genshinAssets/cooking/toCookingRecipe";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The dishes from the game's cook recipe table, each with its specialties and the instruction items that teach it, sorted
// By id as the recipes record of the cooking dataset
export const buildCookingRecipes = (): Record<string, unknown> => {
  const materialRows = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
  const materialMap = new Map(materialRows.map((row) => [row.id, row]));
  const unlockItemIdMap = readUnlockItemIdMap(materialRows, UNLOCK_COOK_RECIPE_USE_OP);
  const bonusRows = readExcelTable<CookBonusRow>(COOK_BONUS_TABLE_NAME);
  const recipes = readExcelTable<CookRecipeRow>(COOK_RECIPE_TABLE_NAME)
    .map((row) => toCookingRecipe(row, { bonusRows, materialMap, unlockItemIds: unlockItemIdMap.get(row.id) ?? [] }))
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  return { [`${GameDataset.Cooking}/recipes`]: recipes };
};
