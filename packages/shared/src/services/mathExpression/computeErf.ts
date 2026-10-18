import { SQRT_PI } from "#src/services/mathExpression/constants";

// The error function. Within three it is a series whose terms are all positive, so it does not cancel. Beyond, the
// Complementary function comes from its continued fraction, read backwards from a fixed depth, and erf is one less it
const SERIES_LIMIT = 3;
const CONTINUED_FRACTION_DEPTH = 80;

export const computeErf = (value: number): number => {
  if (Number.isNaN(value)) return Number.NaN;

  const magnitude = Math.abs(value);
  const sign = value < 0 ? -1 : 1;
  if (magnitude < SERIES_LIMIT) {
    // Erf(x) = 2 / sqrt(pi) * e^(-x^2) * sum of (2x^2)^n * x / (1 * 3 * ... * (2n + 1))
    const squared = magnitude * magnitude;
    let term = magnitude;
    let total = magnitude;
    for (let index = 1; index < 200; index++) {
      term *= (2 * squared) / (2 * index + 1);
      total += term;
      if (term < total * 1e-17) break;
    }
    return (sign * 2 * Math.exp(-squared) * total) / SQRT_PI;
  }

  let fraction = magnitude;
  for (let index = CONTINUED_FRACTION_DEPTH; index >= 1; index--) fraction = magnitude + index / 2 / fraction;
  const complement = Math.exp(-magnitude * magnitude) / SQRT_PI / fraction;
  return sign * (1 - complement);
};
