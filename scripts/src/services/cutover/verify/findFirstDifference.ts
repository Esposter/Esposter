import type { KeyedCanonicalRow } from "#src/models/cutover/KeyedCanonicalRow";

export interface RowDifference {
  key: unknown[];
  reason: "differs" | "missing in source" | "missing in target";
}

// Orders two keys the way both databases order them: numbers by value, text by code unit (the order of the C collation
// and of SQLite's binary one for ASCII keys, which every key here is)
export const compareKeys = (left: unknown[], right: unknown[]): number => {
  for (const [index, leftValue] of left.entries()) {
    const rightValue = right[index];
    if (typeof leftValue === "number" && typeof rightValue === "number" && leftValue !== rightValue)
      return leftValue < rightValue ? -1 : 1;
    const leftText = String(leftValue);
    const rightText = String(rightValue);
    if (leftText !== rightText) return leftText < rightText ? -1 : 1;
  }
  return 0;
};

// Walks both sides in key order and stops at the first row that differs, names a row only one side holds, or differs in a
// value. Each side is read once, so verifying a table costs one pass over each
export const findFirstDifference = async (
  source: AsyncIterator<KeyedCanonicalRow, void>,
  target: AsyncIterator<KeyedCanonicalRow, void>,
): Promise<RowDifference | undefined> => {
  let sourceResult = await source.next();
  let targetResult = await target.next();
  while (!sourceResult.done || !targetResult.done) {
    if (targetResult.done || (!sourceResult.done && compareKeys(sourceResult.value.key, targetResult.value.key) < 0))
      return { key: sourceResult.value?.key ?? [], reason: "missing in target" };
    if (sourceResult.done || compareKeys(targetResult.value.key, sourceResult.value.key) < 0)
      return { key: targetResult.value.key, reason: "missing in source" };
    if (sourceResult.value.canonical !== targetResult.value.canonical)
      return { key: sourceResult.value.key, reason: "differs" };
    sourceResult = await source.next();
    targetResult = await target.next();
  }
  return undefined;
};
