import type { ExcelCombineRow } from "#src/models/genshinAssets/crafting/ExcelCombineRow";
import type { CraftingRecipe } from "genshin-world";

import {
  COMBINE_RECIPE_TYPE,
  CombineTypeCraftingRecipeKindMap,
  CONDENSED_RESIN_CRYSTAL_CORE_ITEM_ID,
  CONDENSED_RESIN_ITEM_ID,
  CONDENSED_RESIN_ORIGINAL_RESIN_COUNT,
  TIER_MATERIAL_COUNT,
} from "#src/services/genshinAssets/crafting/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CraftingRecipeKind, ORIGINAL_RESIN_ITEM_ID } from "genshin-world";

// One bench recipe from its combine row and the instruction items that open it, or undefined for a row the bench does not
// Craft. A tier takes exactly three of one material for one of the next, Condensed Resin exactly its crystal core and its
// Original Resin, and a recipe that is hidden until an instruction
// Opens it must name one, or the world would never offer it
export const toCraftingRecipe = (row: ExcelCombineRow, unlockItemIds: number[]): CraftingRecipe | undefined => {
  if (row.recipeType !== COMBINE_RECIPE_TYPE) return undefined;
  const kind =
    row.resultItemId === CONDENSED_RESIN_ITEM_ID
      ? CraftingRecipeKind.CondensedResin
      : CombineTypeCraftingRecipeKindMap[row.combineType];
  if (kind === undefined) return undefined;
  const materials = row.materialItems.filter(({ id }) => id !== 0).map(({ count, id }) => ({ count, id }));
  const [material] = materials;
  if (materials.length === 0)
    throw new InvalidOperationError(Operation.Read, String(row.combineId), "takes no material");
  if (
    kind === CraftingRecipeKind.Tier &&
    (materials.length !== 1 || material?.count !== TIER_MATERIAL_COUNT || row.resultItemCount !== 1)
  )
    throw new InvalidOperationError(Operation.Read, String(row.combineId), "is not three of a material for one");
  if (
    kind === CraftingRecipeKind.CondensedResin &&
    (materials.length !== 2 ||
      !materials.some(({ count, id }) => id === CONDENSED_RESIN_CRYSTAL_CORE_ITEM_ID && count === 1) ||
      !materials.some(
        ({ count, id }) => id === ORIGINAL_RESIN_ITEM_ID && count === CONDENSED_RESIN_ORIGINAL_RESIN_COUNT,
      ))
  )
    throw new InvalidOperationError(
      Operation.Read,
      String(row.combineId),
      "is not one crystal core and sixty Original Resin",
    );
  if (!row.isDefaultShow && unlockItemIds.length === 0)
    throw new InvalidOperationError(Operation.Read, String(row.combineId), "is hidden with no instruction to open it");
  return {
    id: row.combineId,
    kind,
    materials,
    mora: row.scoinCost,
    playerLevel: row.playerLevel,
    resultCount: row.resultItemCount,
    resultItemId: row.resultItemId,
    unlockItemIds,
  };
};
