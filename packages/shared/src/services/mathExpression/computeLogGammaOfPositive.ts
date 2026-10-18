// Stirling's series for the log of the gamma function, accurate to machine precision once its argument is this large
const STIRLING_THRESHOLD = 15;
const STIRLING_TERMS: readonly number[] = [1 / 12, -1 / 360, 1 / 1260, -1 / 1680, 1 / 1188, -691 / 360360, 1 / 156];

const computeStirlingLogGamma = (value: number): number => {
  const inverse = 1 / value;
  const squared = inverse * inverse;
  let power = inverse;
  let series = 0;
  for (const term of STIRLING_TERMS) {
    series += term * power;
    power *= squared;
  }
  return (value - 0.5) * Math.log(value) - value + 0.5 * Math.log(2 * Math.PI) + series;
};

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
