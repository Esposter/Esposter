import { computeErf } from "#src/services/function/computeErf";
import { computeInitialGuess } from "#src/services/function/computeInitialGuess";
import { REFINEMENT_STEPS, SQRT_PI } from "#src/services/function/constants";

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
