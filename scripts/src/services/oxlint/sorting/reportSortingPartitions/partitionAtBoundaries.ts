import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

// The items cut into partitions: an item the check rejects is a boundary, which ends the partition it is in and starts a
// New one, and each item the check passes becomes a sorting node in the partition it lands in. The first partition is
// There even when no item precedes a boundary
export const partitionAtBoundaries = <T, TItem extends T>(
  items: readonly T[],
  checkIsItem: (item: T) => item is TItem,
  buildNode: (item: TItem) => SortingNode,
): SortingNode[][] => {
  const partitions: SortingNode[][] = [];
  let partition: SortingNode[] = [];
  partitions.push(partition);
  for (const item of items) {
    if (!checkIsItem(item)) {
      partition = [];
      partitions.push(partition);
      continue;
    }
    partition.push(buildNode(item));
  }
  return partitions;
};
