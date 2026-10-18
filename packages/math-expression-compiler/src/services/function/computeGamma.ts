import { computeLogGammaOfPositive } from "#src/services/function/computeLogGammaOfPositive";

// The gamma function overflows above this argument, and an integer above the last factorial is infinite
const OVERFLOW_ARGUMENT = 171.35;
const LAST_FACTORIAL_ARGUMENT = 171;

// The product of the integers from first to last, split in halves, so each rounding falls where mathjs's does
const computeProductOfRange = (first: number, last: number): number => {
  if (last < first) return 1;
  if (last === first) return last;

  const middle = Math.floor((first + last) / 2);
  return computeProductOfRange(first, middle) * computeProductOfRange(middle + 1, last);
};

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
