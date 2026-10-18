import { computeGamma } from "#src/services/computeGamma";

// The Riemann zeta function. Above zero it is the Euler-Maclaurin sum, whose Bernoulli terms make it exact to machine precision.
// Below zero the functional equation turns it into that sum at one minus the argument
const EULER_MACLAURIN_COEFFICIENTS: readonly number[] = [
  1 / 12,
  -1 / 720,
  1 / 30240,
  -1 / 1209600,
  1 / 47900160,
  -691 / 1307674368000,
  1 / 74724249600,
  -3617 / 10670622842880000,
];
const SUMMATION_LIMIT = 10;

const computeSummedZeta = (value: number): number => {
  let total = 0;
  for (let integer = 1; integer < SUMMATION_LIMIT; integer++) total += integer ** -value;

  total += SUMMATION_LIMIT ** (1 - value) / (value - 1) + 0.5 * SUMMATION_LIMIT ** -value;
  let rising = value;
  for (let index = 1; index <= EULER_MACLAURIN_COEFFICIENTS.length; index++) {
    const coefficient = EULER_MACLAURIN_COEFFICIENTS[index - 1] ?? 0;
    total += coefficient * rising * SUMMATION_LIMIT ** (-value - 2 * index + 1);
    rising *= (value + 2 * index - 1) * (value + 2 * index);
  }
  return total;
};

export const computeZeta = (value: number): number => {
  if (Number.isNaN(value) || !Number.isFinite(value)) return Number.NaN;
  if (value === 1) return Number.NaN;
  if (value === 0) return -0.5;
  if (value > 0) return computeSummedZeta(value);
  // Every negative even integer is a trivial zero
  if (Number.isInteger(value) && value % 2 === 0) return 0;

  return (
    2 ** value *
    Math.PI ** (value - 1) *
    Math.sin((Math.PI * value) / 2) *
    computeGamma(1 - value) *
    computeSummedZeta(1 - value)
  );
};
