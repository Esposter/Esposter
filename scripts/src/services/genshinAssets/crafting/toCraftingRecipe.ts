import type { ExcelCombineRow } from "#src/models/genshinAssets/crafting/ExcelCombineRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { CraftingRecipe } from "genshin-world";

import {
  COMBINE_RECIPE_TYPE,
  CombineTypeCraftingRecipeKindMap,
  CONDENSED_RESIN_CRYSTAL_CORE_ITEM_ID,
  CONDENSED_RESIN_ITEM_ID,
  CONDENSED_RESIN_ORIGINAL_RESIN_COUNT,
  CONVERT_COMBINE_TYPES,
  CONVERT_RECIPE_TYPE,
  TIER_MATERIAL_COUNT,
} from "#src/services/genshinAssets/crafting/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { CraftingRecipeKind, ORIGINAL_RESIN_ITEM_ID } from "genshin-world";

// The kind of a row the bench holds, or undefined for one it does not: a conversion of one of the combine types it lists,
// Or a craft of a combine type the bench's table names
const toRecipeKind = (row: ExcelCombineRow): CraftingRecipeKind | undefined => {
  if (row.recipeType === CONVERT_RECIPE_TYPE)
    return CONVERT_COMBINE_TYPES.includes(row.combineType) ? CraftingRecipeKind.Convert : undefined;
  if (row.recipeType !== COMBINE_RECIPE_TYPE) return undefined;
  return row.resultItemId === CONDENSED_RESIN_ITEM_ID
    ? CraftingRecipeKind.CondensedResin
    : CombineTypeCraftingRecipeKindMap[row.combineType];
};

// One bench recipe from its combine row and the instruction items that open it, or undefined for a row the bench does not
// Hold. A tier takes exactly three of one material for one of the next, Condensed Resin exactly its crystal core and its
// Original Resin, a conversion one material and the catalyst it takes, and a recipe that is hidden until an instruction
// Opens it must name one, or the world would never offer it. A recipe is named by the item it makes
export const toCraftingRecipe = (
  row: ExcelCombineRow,
  { materialMap, unlockItemIds }: { materialMap: Map<number, MaterialRow>; unlockItemIds: number[] },
): CraftingRecipe | undefined => {
  const kind = toRecipeKind(row);
  if (kind === undefined) return undefined;
  const materials = row.materialItems.filter(({ id }) => id !== 0).map(({ count, id }) => ({ count, id }));
  const [material] = materials;
  if (materials.length === 0)
    throw new InvalidOperationError(Operation.Read, String(row.combineId), "takes no material");
  if (kind === CraftingRecipeKind.Convert && (materials.length !== 2 || row.resultItemCount !== 1))
    throw new InvalidOperationError(
      Operation.Read,
      String(row.combineId),
      "is not one material and the catalyst it takes",
    );
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
  const resultMaterial = materialMap.get(row.resultItemId);
  if (!resultMaterial)
    throw new InvalidOperationError(Operation.Read, String(row.combineId), "makes an item the material table lacks");
  return {
    combineType: row.combineType,
    id: row.combineId,
    kind,
    materials,
    mora: row.scoinCost,
    nameTextId: String(resultMaterial.nameTextMapHash),
    playerLevel: row.playerLevel,
    resultCount: row.resultItemCount,
    resultItemId: row.resultItemId,
    unlockItemIds,
  };
};
