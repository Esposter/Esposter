import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

// The instruction items of each recipe, read off the material table: an item whose use is `useOp` names the recipe it opens
// By its id as its first parameter, so each recipe's list is every item that opens it, in the table's order
export const readUnlockItemIdMap = (materialRows: MaterialRow[], useOp: string): Map<number, number[]> => {
  const unlocks = materialRows.flatMap(({ id, itemUse }) =>
    itemUse.filter((use) => use.useOp === useOp).map(({ useParam }) => ({ itemId: id, recipeId: Number(useParam[0]) })),
  );
  return new Map(
    Array.from(
      Map.groupBy(unlocks, ({ recipeId }) => recipeId),
      ([recipeId, group]) => [recipeId, group.map(({ itemId }) => itemId)],
    ),
  );
};
