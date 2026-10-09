import type { ExcelCombineRow } from "#src/models/genshinAssets/crafting/ExcelCombineRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  COMBINE_TABLE_NAME,
  CRAFTING_GENERATED_DIRECTORY,
  CRAFTING_RECIPES_PATH,
  MATERIAL_TABLE_NAME,
  UNLOCK_COMBINE_USE_OP,
} from "#src/services/genshinAssets/crafting/constants";
import { toCraftingRecipe } from "#src/services/genshinAssets/crafting/toCraftingRecipe";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// The bench's recipes from the game's combine table, each with the instruction items that open it, written as one
// Slice in the world's generated folder. A row the bench does not craft is left out
export const writeCraftingRecipes = (): void => {
  const materialRows = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
  const materialMap = new Map(materialRows.map((row) => [row.id, row]));
  const unlockItemIdMap = readUnlockItemIdMap(materialRows, UNLOCK_COMBINE_USE_OP);
  const recipes = readExcelTable<ExcelCombineRow>(COMBINE_TABLE_NAME)
    .flatMap((row) => {
      const recipe = toCraftingRecipe(row, { materialMap, unlockItemIds: unlockItemIdMap.get(row.combineId) ?? [] });
      return recipe ? [recipe] : [];
    })
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  mkdirSync(CRAFTING_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(CRAFTING_RECIPES_PATH, `${JSON.stringify(recipes, undefined, 2)}\n`);
};
