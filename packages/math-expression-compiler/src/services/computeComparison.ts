import { checkIsNearlyEqual } from "#src/services/checkIsNearlyEqual";

// Three-way comparison: zero when nearly equal, one when larger, and minus one otherwise, so an unordered NaN compares as
// Less, as mathjs compares it
export const computeComparison = (left: number, right: number): number => {
  if (checkIsNearlyEqual(left, right)) return 0;
  return left > right ? 1 : -1;
};
