import { computeComparison } from "#src/services/function/computeComparison";

// Lists compare element by element, and where one runs out first, the shorter list is the smaller, as mathjs compares them
export const computeListComparison = (left: number[], right: number[]): number => {
  for (const [index, value] of left.entries()) {
    const other = right[index];
    if (other === undefined) return 1;

    const comparison = computeComparison(value, other);
    if (comparison !== 0) return comparison;
  }
  return left.length < right.length ? -1 : 0;
};
