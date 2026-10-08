import type { CookBonusRow } from "#src/models/genshinAssets/cooking/CookBonusRow";
import type { CookRecipeRow } from "#src/models/genshinAssets/cooking/CookRecipeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  COOK_BONUS_TABLE_NAME,
  COOK_RECIPE_TABLE_NAME,
  COOKING_GENERATED_DIRECTORY,
  COOKING_RECIPES_PATH,
} from "#src/services/genshinAssets/cooking/constants";
import { readCookUnlockItemIdMap } from "#src/services/genshinAssets/cooking/readCookUnlockItemIdMap";
import { toCookingRecipe } from "#src/services/genshinAssets/cooking/toCookingRecipe";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// The dishes from the game's cook recipe table, each with its specialties and the instruction items that teach it, written
// As one slice in the world's generated folder, by id
export const writeCookingRecipes = (): void => {
  const materialRows = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
  const materialMap = new Map(materialRows.map((row) => [row.id, row]));
  const unlockItemIdMap = readCookUnlockItemIdMap(materialRows);
  const bonusRows = readExcelTable<CookBonusRow>(COOK_BONUS_TABLE_NAME);
  const recipes = readExcelTable<CookRecipeRow>(COOK_RECIPE_TABLE_NAME)
    .map((row) => toCookingRecipe(row, { bonusRows, materialMap, unlockItemIds: unlockItemIdMap.get(row.id) ?? [] }))
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  mkdirSync(COOKING_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(COOKING_RECIPES_PATH, `${JSON.stringify(recipes, undefined, 2)}\n`);
};
