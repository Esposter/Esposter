import { EULER_MACLAURIN_COEFFICIENTS, SUMMATION_LIMIT } from "#src/services/function/constants";

export const computeSummedZeta = (value: number): number => {
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
