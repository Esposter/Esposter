import type { ExcelForgeRandomRow } from "#src/models/genshinAssets/forging/ExcelForgeRandomRow";
import type { ExcelForgeRow } from "#src/models/genshinAssets/forging/ExcelForgeRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/crafting/constants";
import {
  FORGE_RANDOM_TABLE_NAME,
  FORGE_TABLE_NAME,
  FORGING_GENERATED_DIRECTORY,
  FORGING_RECIPES_PATH,
  UNLOCK_FORGE_USE_OP,
} from "#src/services/genshinAssets/forging/constants";
import { toForgeRecipe } from "#src/services/genshinAssets/forging/toForgeRecipe";
import { toForgeResults } from "#src/services/genshinAssets/forging/toForgeResults";
import { readUnlockItemIdMap } from "#src/services/genshinAssets/items/readUnlockItemIdMap";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { mkdirSync, writeFileSync } from "node:fs";

// The blacksmith's recipes from the game's forge table, each with the diagrams that open it, written as one slice in the
// World's generated folder. A row the blacksmith does not forge is left out
export const writeForgingRecipes = (): void => {
  const unlockItemIdMap = readUnlockItemIdMap(readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME), UNLOCK_FORGE_USE_OP);
  const randomRows = readExcelTable<ExcelForgeRandomRow>(FORGE_RANDOM_TABLE_NAME);
  const recipes = readExcelTable<ExcelForgeRow>(FORGE_TABLE_NAME)
    .flatMap((row) => {
      const recipe = toForgeRecipe(row, unlockItemIdMap.get(row.id) ?? [], toForgeResults(row, randomRows));
      return recipe ? [recipe] : [];
    })
    .toSorted((firstRecipe, secondRecipe) => firstRecipe.id - secondRecipe.id);
  mkdirSync(FORGING_GENERATED_DIRECTORY, { recursive: true });
  writeFileSync(FORGING_RECIPES_PATH, `${JSON.stringify(recipes, undefined, 2)}\n`);
};
