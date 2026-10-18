import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";

// Whether a number is smaller than another and not nearly equal to it, as mathjs's smaller reads them
export const checkIsSmaller = (left: number, right: number): boolean =>
  left < right && !checkIsNearlyEqual(left, right);
