import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";
import { MAXIMUM_SNAP_QUOTIENT } from "#src/services/function/constants";

// A floored modulo that takes the divisor's sign. A quotient nearly equal to an integer, as a rounding residue leaves it,
// Is an exact multiple, so the result is zero rather than a tiny residue of either sign. Past MAXIMUM_SNAP_QUOTIENT every
// Quotient is that close to a whole number, so two integers take their exact residue instead. Other operands keep the snap,
// since a double quotient cannot hold the fraction of a residue that large. A zero divisor keeps the dividend, and a
// Non-finite operand is NaN otherwise, as mathjs answers
export const computeModulo = (dividend: number, divisor: number): number => {
  if (divisor === 0) return dividend;
  if (!Number.isFinite(dividend) || !Number.isFinite(divisor)) return Number.NaN;

  const quotient = dividend / divisor;
  if (Math.abs(quotient) >= MAXIMUM_SNAP_QUOTIENT && Number.isInteger(dividend) && Number.isInteger(divisor)) {
    const remainder = BigInt(dividend) % BigInt(divisor);
    // The remainder takes the dividend's sign, so it moves to the divisor's sign where the two differ
    const isSignDiffering = remainder !== 0n && remainder < 0n !== divisor < 0;
    return Number(isSignDiffering ? remainder + BigInt(divisor) : remainder);
  }
  if (checkIsNearlyEqual(quotient, Math.round(quotient))) return 0;
  return dividend - divisor * Math.floor(quotient);
};
