import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// The one item a material's English name is, which the wiki names a drop by. A name that is no item, or is more than
// One, is an Error rather than a guess
export const toMaterialItemId = (name: string, nameItemIdsMap: ReadonlyMap<string, number[]>): number => {
  const itemIds = nameItemIdsMap.get(name) ?? [];
  if (itemIds.length !== 1)
    throw new InvalidOperationError(
      Operation.Read,
      name,
      itemIds.length === 0 ? "names no material" : "names more than one material",
    );
  return takeOne(itemIds);
};
