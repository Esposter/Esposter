import { computePolynomial } from "#src/services/function/computePolynomial";
import { HIGH_TAIL_COEFFICIENTS, LOW_TAIL_COEFFICIENTS } from "#src/services/function/constants";

export const computeInitialGuess = (value: number): number => {
  const weight = -Math.log((1 - value) * (1 + value));
  if (weight < 5) return computePolynomial(2.81022636e-8, LOW_TAIL_COEFFICIENTS, weight - 2.5) * value;
  return computePolynomial(-0.000200214257, HIGH_TAIL_COEFFICIENTS, Math.sqrt(weight) - 3) * value;
};
