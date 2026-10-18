// The inverse of the hyperbolic cotangent, by its logarithm of one plus a small term, which keeps the precision that
// Atanh of the reciprocal loses when the argument is close to one
export const computeInverseCoth = (value: number): number => {
  const magnitude = Math.abs(value);
  if (magnitude < 1) return Number.NaN;
  if (magnitude === 1) return value * Number.POSITIVE_INFINITY;
  return Math.sign(value) * 0.5 * Math.log1p(2 / (magnitude - 1));
};
