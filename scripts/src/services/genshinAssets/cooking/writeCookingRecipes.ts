import type { CookBonusRow } from "#src/models/genshinAssets/cooking/CookBonusRow";
import type { CookRecipeRow } from "#src/models/genshinAssets/cooking/CookRecipeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  COOK_BONUS_TABLE_NAME,
  COOK_RECIPE_TABLE_NAME,
  COOKING_GENERATED_DIRECTORY,
  COOKING_RECIPES_PATH,
  UNLOCK_COOK_RECIPE_USE_OP,
} from "#src/services/genshinAssets/cooking/constants";
import { toCookingRecipe } from "#src/services/genshinAssets/cooking/toCookingRecipe";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";

// The dishes from the game's cook recipe table, each with its specialties and the instruction items that teach it, written
// As one slice in the world's generated folder, by id
export const writeCookingRecipes = (): void => {
  const materialRows = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
  const materialMap = new Map(materialRows.map((row) => [row.id, row]));
  const unlockItemIdMap = readUnlockItemIdMap(materialRows, UNLOCK_COOK_RECIPE_USE_OP);
  const bonusRows = readExcelTable<CookBonusRow>(COOK_BONUS_TABLE_NAME);
  const recipes = readExcelTable<CookRecipeRow>(COOK_RECIPE_TABLE_NAME)
    .map((row) => toCookingRecipe(row, { bonusRows, materialMap, unlockItemIds: unlockItemIdMap.get(row.id) ?? [] }))
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  mkdirSync(COOKING_GENERATED_DIRECTORY, { recursive: true });
  writeJsonFile(COOKING_RECIPES_PATH, recipes);
};
