import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { UNLOCK_COMBINE_USE_OP } from "#src/services/genshinAssets/crafting/constants";

// The instruction items of each recipe, read off the material table: an item whose use opens a combine row names it by
// Its id as its first parameter, so each recipe's list is every item that opens it, in the table's order
export const readCombineUnlockItemIdMap = (materialRows: MaterialRow[]): Map<number, number[]> => {
  const unlocks = materialRows.flatMap(({ id, itemUse }) =>
    itemUse
      .filter(({ useOp }) => useOp === UNLOCK_COMBINE_USE_OP)
      .map(({ useParam }) => ({ combineId: Number(useParam[0]), itemId: id })),
  );
  return new Map(
    Array.from(
      Map.groupBy(unlocks, ({ combineId }) => combineId),
      ([combineId, group]) => [combineId, group.map(({ itemId }) => itemId)],
    ),
  );
};
