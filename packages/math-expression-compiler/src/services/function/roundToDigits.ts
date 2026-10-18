import { MAXIMUM_DIGITS } from "#src/services/function/constants";
import { shiftDecimalPlaces } from "#src/services/function/shiftDecimalPlaces";

// Rounds a value to a count of decimal places by the rounder, moving the decimal point through the shortest decimal form.
// An integer is already rounded, and every integer past the shift's range is one, so it is returned as it is
export const roundToDigits = (rounder: (value: number) => number, value: number, digits: number): null | number => {
  if (!Number.isInteger(digits) || digits < 0 || digits > MAXIMUM_DIGITS) return null;
  if (!Number.isFinite(value)) return value;
  // The sum with zero gives the positive zero that the shifts give a rounded zero
  if (Number.isInteger(value)) return value + 0;
  if (digits === 0) return rounder(value) + 0;
  return shiftDecimalPlaces(rounder(shiftDecimalPlaces(value, digits)), -digits);
};
