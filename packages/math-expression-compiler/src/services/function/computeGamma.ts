import { computeLogGammaOfPositive } from "#src/services/function/computeLogGammaOfPositive";
import { computeProductOfRange } from "#src/services/function/computeProductOfRange";
import { LAST_FACTORIAL_ARGUMENT, OVERFLOW_ARGUMENT } from "#src/services/function/constants";

export const computeGamma = (value: number): number => {
  if (Number.isNaN(value)) return Number.NaN;
  if (Number.isInteger(value)) {
    if (value <= 0 || value > LAST_FACTORIAL_ARGUMENT) return Number.POSITIVE_INFINITY;

    return computeProductOfRange(1, value - 1);
  }
  if (value < 0.5) return Math.PI / (Math.sin(Math.PI * value) * computeGamma(1 - value));
  if (value >= OVERFLOW_ARGUMENT) return Number.POSITIVE_INFINITY;

  const { logGamma, product } = computeLogGammaOfPositive(value);
  return Math.exp(logGamma) / product;
};
