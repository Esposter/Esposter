import type { ExcelForgeRandomRow } from "#src/models/genshinAssets/forging/ExcelForgeRandomRow";
import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import {
  FORGE_RANDOM_TABLE_NAME,
  FORGE_TABLE_NAME,
  UNLOCK_FORGE_USE_OP,
} from "#src/services/genshinAssets/forging/constants";
import { toForgeRecipe } from "#src/services/genshinAssets/forging/toForgeRecipe";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The blacksmith's recipes from the game's forge table, each with the diagrams that open it, sorted by id as the
// Recipes record of the forging dataset. A row the blacksmith does not forge is left out
export const buildForgingRecipes = (): Record<string, unknown> => {
  const unlockItemIdMap = readUnlockItemIdMap(readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME), UNLOCK_FORGE_USE_OP);
  const randomRows = readExcelTable<ExcelForgeRandomRow>(FORGE_RANDOM_TABLE_NAME);
  const recipes = readExcelTable<ExcelForgeRow>(FORGE_TABLE_NAME)
    .flatMap((row) => {
      const recipe = toForgeRecipe(row, unlockItemIdMap.get(row.id) ?? [], randomRows);
      return recipe ? [recipe] : [];
    })
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  return { [`${GameDataset.Forging}/recipes`]: recipes };
};
