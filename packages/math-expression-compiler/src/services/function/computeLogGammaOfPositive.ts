import { computeStirlingLogGamma } from "#src/services/function/computeStirlingLogGamma";
import { STIRLING_THRESHOLD } from "#src/services/function/constants";

// The log of the gamma function of a positive number. The argument is first moved above the threshold by the recurrence
// Gamma(z + 1) = z * gamma(z), and the product of the moves is returned for the caller to take back
export const computeLogGammaOfPositive = (value: number): { logGamma: number; product: number } => {
  let shifted = value;
  let product = 1;
  while (shifted < STIRLING_THRESHOLD) {
    product *= shifted;
    shifted += 1;
  }
  return { logGamma: computeStirlingLogGamma(shifted), product };
};
