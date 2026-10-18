import { STIRLING_TERMS } from "#src/services/function/constants";

export const computeStirlingLogGamma = (value: number): number => {
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
