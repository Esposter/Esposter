import { computeErf } from "#src/services/computeErf";
import { SQRT_PI } from "#src/services/constants";

// The inverse of the error function: Giles's approximation gives the first guess, and Newton steps on erf itself refine
// It, so that erf of the result returns the argument to machine precision
const REFINEMENT_STEPS = 4;
const LOW_TAIL_COEFFICIENTS: readonly number[] = [
  3.43273939e-7, -3.5233877e-6, -4.39150654e-6, 0.00021858087, -0.00125372503, -0.00417768164, 0.246640727, 1.50140941,
];
const HIGH_TAIL_COEFFICIENTS: readonly number[] = [
  0.000100950558, 0.00134934322, -0.00367342844, 0.00573950773, -0.0076224613, 0.00943887047, 1.00167406, 2.83297682,
];

const computePolynomial = (leading: number, coefficients: readonly number[], variable: number): number => {
  let polynomial = leading;
  for (const coefficient of coefficients) polynomial = coefficient + polynomial * variable;
  return polynomial;
};

const computeInitialGuess = (value: number): number => {
  const weight = -Math.log((1 - value) * (1 + value));
  if (weight < 5) return computePolynomial(2.81022636e-8, LOW_TAIL_COEFFICIENTS, weight - 2.5) * value;
  return computePolynomial(-0.000200214257, HIGH_TAIL_COEFFICIENTS, Math.sqrt(weight) - 3) * value;
};

export const computeErfInverse = (value: number): number => {
  if (Number.isNaN(value) || value < -1 || value > 1) return Number.NaN;
  if (value === 1) return Number.POSITIVE_INFINITY;
  if (value === -1) return Number.NEGATIVE_INFINITY;

  let estimate = computeInitialGuess(value);
  for (let step = 0; step < REFINEMENT_STEPS; step++) {
    const slope = (2 / SQRT_PI) * Math.exp(-estimate * estimate);
    estimate -= (computeErf(estimate) - value) / slope;
  }
  return estimate;
};
