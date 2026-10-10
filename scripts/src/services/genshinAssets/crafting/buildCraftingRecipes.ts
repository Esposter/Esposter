import type { ExcelCombineRow } from "#src/models/genshinAssets/crafting/ExcelCombineRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  COMBINE_TABLE_NAME,
  MATERIAL_TABLE_NAME,
  UNLOCK_COMBINE_USE_OP,
} from "#src/services/genshinAssets/crafting/constants";
import { toCraftingRecipe } from "#src/services/genshinAssets/crafting/toCraftingRecipe";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The bench's recipes from the game's combine table, each with the instruction items that open it, sorted by id as the
// Recipes record of the crafting dataset. A row the bench does not craft is left out
export const buildCraftingRecipes = (): Record<string, unknown> => {
  const materialRows = readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME);
  const materialMap = new Map(materialRows.map((row) => [row.id, row]));
  const unlockItemIdMap = readUnlockItemIdMap(materialRows, UNLOCK_COMBINE_USE_OP);
  const recipes = readExcelTable<ExcelCombineRow>(COMBINE_TABLE_NAME)
    .flatMap((row) => {
      const recipe = toCraftingRecipe(row, { materialMap, unlockItemIds: unlockItemIdMap.get(row.combineId) ?? [] });
      return recipe ? [recipe] : [];
    })
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  return { [`${GameDataset.Crafting}/recipes`]: recipes };
};
