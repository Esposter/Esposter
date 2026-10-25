export const formatCounts = (countMap: ReadonlyMap<string, number>): string =>
  [...countMap]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([key, count]) => `${key} ${count}`)
    .join(", ") || "none";
