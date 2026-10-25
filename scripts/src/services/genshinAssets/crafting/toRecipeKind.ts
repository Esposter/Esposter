import type { ExcelCombineRow } from "#src/models/genshinAssets/crafting/ExcelCombineRow";

import {
  COMBINE_RECIPE_TYPE,
  CombineTypeCraftingRecipeKindMap,
  CONDENSED_RESIN_ITEM_ID,
  CONVERT_COMBINE_TYPES,
  CONVERT_RECIPE_TYPE,
} from "#src/services/genshinAssets/crafting/constants";
import { CraftingRecipeKind } from "genshin-world";

// The kind of a row the bench holds, or undefined for one it does not: a conversion of one of the combine types it lists,
// Or a craft of a combine type the bench's table names
export const toRecipeKind = (row: ExcelCombineRow): CraftingRecipeKind | undefined => {
  if (row.recipeType === CONVERT_RECIPE_TYPE)
    return CONVERT_COMBINE_TYPES.includes(row.combineType) ? CraftingRecipeKind.Convert : undefined;
  if (row.recipeType !== COMBINE_RECIPE_TYPE) return undefined;
  return row.resultItemId === CONDENSED_RESIN_ITEM_ID
    ? CraftingRecipeKind.CondensedResin
    : CombineTypeCraftingRecipeKindMap[row.combineType];
};
