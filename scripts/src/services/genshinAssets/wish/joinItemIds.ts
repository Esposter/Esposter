import { InvalidOperationError, Operation } from "@esposter/shared";

// The ids a featured name joins, every item the names hold under it. A name joining none fails the build rather than
// Dropping the item from its banner
export const joinItemIds = (name: string, nameIdsMap: ReadonlyMap<string, readonly number[]>): number[] => {
  const ids = nameIdsMap.get(name) ?? [];
  if (ids.length === 0) throw new InvalidOperationError(Operation.Read, name, "joins no item in the names");

  return [...ids];
};
