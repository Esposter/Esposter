import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";

// A floored modulo that takes the divisor's sign. Two integers take their exact residue, since the double remainder of two
// Integers is exact, so no quotient is rounded into a whole multiple. Any other operand whose quotient is nearly an integer,
// As a rounding residue leaves it, is an exact multiple, so the result is zero rather than a tiny residue of either sign.
// A zero divisor keeps the dividend, and a non-finite operand is NaN otherwise, as mathjs answers
export const computeModulo = (dividend: number, divisor: number): number => {
  if (divisor === 0) return dividend;
  if (!Number.isFinite(dividend) || !Number.isFinite(divisor)) return Number.NaN;

  if (Number.isInteger(dividend) && Number.isInteger(divisor)) {
    const remainder = dividend % divisor;
    // A zero residue is zero of either sign, so it is returned as the positive zero
    if (remainder === 0) return 0;
    // The remainder takes the dividend's sign, so it moves to the divisor's sign where the two differ
    return Math.sign(remainder) === Math.sign(divisor) ? remainder : remainder + divisor;
  }

  const quotient = dividend / divisor;
  if (checkIsNearlyEqual(quotient, Math.round(quotient))) return 0;
  return dividend - divisor * Math.floor(quotient);
};
