import { computeLogGammaOfPositive } from "#src/services/mathExpression/computeLogGammaOfPositive";

// The natural log of the gamma function, where it is real: NaN below zero, and infinite at zero
export const computeLogGamma = (value: number): number => {
  if (Number.isNaN(value) || value < 0) return Number.NaN;
  if (value === 0) return Number.POSITIVE_INFINITY;
  // Gamma is exactly one at one and at two
  if (value === 1 || value === 2) return 0;

  const { logGamma, product } = computeLogGammaOfPositive(value);
  return logGamma - Math.log(product);
};
