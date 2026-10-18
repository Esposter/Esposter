import { computeLogGammaOfPositive } from "#src/services/computeLogGammaOfPositive";

// The gamma function overflows above this argument, and an integer above the last factorial is infinite
const OVERFLOW_ARGUMENT = 171.35;
const LAST_FACTORIAL_ARGUMENT = 171;

export const computeGamma = (value: number): number => {
  if (Number.isNaN(value)) return Number.NaN;
  if (Number.isInteger(value)) {
    if (value <= 0 || value > LAST_FACTORIAL_ARGUMENT) return Number.POSITIVE_INFINITY;

    let product = 1;
    for (let factor = 2; factor < value; factor++) product *= factor;
    return product;
  }
  if (value < 0.5) return Math.PI / (Math.sin(Math.PI * value) * computeGamma(1 - value));
  if (value >= OVERFLOW_ARGUMENT) return Number.POSITIVE_INFINITY;

  const { logGamma, product } = computeLogGammaOfPositive(value);
  return Math.exp(logGamma) / product;
};
