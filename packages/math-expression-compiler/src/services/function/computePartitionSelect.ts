import { compareNumbers } from "#src/services/function/compareNumbers";

// The value at an index of a list in ascending order, which an index outside the list is an error for
export const computePartitionSelect = (values: number[], index: number): null | number => {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) return null;
  return values.toSorted(compareNumbers)[index] ?? null;
};
