import { computeLogGammaOfPositive } from "#src/services/function/computeLogGammaOfPositive";

// The natural log of the gamma function, where it is real: NaN below zero, and infinite at zero and at infinity
export const computeLogGamma = (value: number): number => {
  if (Number.isNaN(value) || value < 0) return Number.NaN;
  if ([0, Number.POSITIVE_INFINITY].includes(value)) return Number.POSITIVE_INFINITY;
  // Gamma is exactly one at one and at two
  if ([1, 2].includes(value)) return 0;

  const { logGamma, product } = computeLogGammaOfPositive(value);
  return logGamma - Math.log(product);
};
