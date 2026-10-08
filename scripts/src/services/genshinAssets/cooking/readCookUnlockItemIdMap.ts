import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { UNLOCK_COOK_RECIPE_USE_OP } from "#src/services/genshinAssets/cooking/constants";

// The instruction items of each dish, read off the material table: an item whose use teaches a cook recipe names it by
// Its id as its first parameter, so each dish's list is every item that teaches it, in the table's order
export const readCookUnlockItemIdMap = (materialRows: MaterialRow[]): Map<number, number[]> => {
  const unlocks = materialRows.flatMap(({ id, itemUse }) =>
    itemUse
      .filter(({ useOp }) => useOp === UNLOCK_COOK_RECIPE_USE_OP)
      .map(({ useParam }) => ({ itemId: id, recipeId: Number(useParam[0]) })),
  );
  return new Map(
    Array.from(
      Map.groupBy(unlocks, ({ recipeId }) => recipeId),
      ([recipeId, group]) => [recipeId, group.map(({ itemId }) => itemId)],
    ),
  );
};
