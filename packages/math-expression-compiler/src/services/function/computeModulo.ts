import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";

// A floored modulo that takes the divisor's sign. A quotient nearly equal to an integer, as a rounding residue leaves it,
// Is an exact multiple, so the result is zero rather than a tiny residue of either sign
export const computeModulo = (dividend: number, divisor: number): number => {
  if (divisor === 0) return dividend;

  const quotient = dividend / divisor;
  if (checkIsNearlyEqual(quotient, Math.round(quotient))) return 0;
  return dividend - divisor * Math.floor(quotient);
};
