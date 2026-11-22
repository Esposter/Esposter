// Packs items into batches each holding at most the limit of weight, first fit in decreasing weight, so a batch fills
// Before the next one opens. An item is never split, so an item heavier than the limit is a batch of its own
export const getBatches = <T>(items: readonly T[], getWeight: (item: T) => number, limit: number): T[][] => {
  const batches: { items: T[]; weight: number }[] = [];
  for (const item of items.toSorted((firstItem, secondItem) => getWeight(secondItem) - getWeight(firstItem))) {
    const weight = getWeight(item);
    const batch = batches.find((candidate) => candidate.weight + weight <= limit);
    if (batch === undefined) batches.push({ items: [item], weight });
    else {
      batch.items.push(item);
      batch.weight += weight;
    }
  }
  return batches.map(({ items: batchItems }) => batchItems);
};
