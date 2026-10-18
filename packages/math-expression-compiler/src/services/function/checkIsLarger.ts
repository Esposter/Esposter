import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";

// Whether a number is larger than another and not nearly equal to it, as mathjs's larger reads them
export const checkIsLarger = (left: number, right: number): boolean => left > right && !checkIsNearlyEqual(left, right);
