import { MATH_EXPRESSION_ABSOLUTE_TOLERANCE, MATH_EXPRESSION_RELATIVE_TOLERANCE } from "#src/services/constants";

// Two numbers are equal when they differ by no more than the larger of a relative and an absolute tolerance, so that
// `0.1 + 0.2` equals `0.3`, as mathjs's comparisons read them. A NaN equals nothing, and an infinity only itself
export const checkIsNearlyEqual = (left: number, right: number): boolean => {
  if (Number.isNaN(left) || Number.isNaN(right)) return false;
  if (!Number.isFinite(left) || !Number.isFinite(right)) return left === right;
  if (left === right) return true;

  const largest = Math.max(Math.abs(left), Math.abs(right));
  const tolerance = Math.max(MATH_EXPRESSION_RELATIVE_TOLERANCE * largest, MATH_EXPRESSION_ABSOLUTE_TOLERANCE);
  return Math.abs(left - right) <= tolerance;
};
