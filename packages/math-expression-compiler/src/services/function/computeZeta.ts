import { computeGamma } from "#src/services/function/computeGamma";
import { computeLogGamma } from "#src/services/function/computeLogGamma";
import { computeSummedZeta } from "#src/services/function/computeSummedZeta";
import { OVERFLOW_ARGUMENT } from "#src/services/function/constants";

export const computeZeta = (value: number): number => {
  // The series tends to its first term as the argument grows without bound, so the zeta of plus infinity is one, as mathjs answers
  if (value === Number.POSITIVE_INFINITY) return 1;
  if (!Number.isFinite(value)) return Number.NaN;
  if (value === 1) return Number.NaN;
  if (value === 0) return -0.5;
  if (value > 0) return computeSummedZeta(value);
  // Every negative even integer is a trivial zero
  if (Number.isInteger(value) && value % 2 === 0) return 0;
  // Past the gamma overflow the terms are multiplied as logs, so a finite zeta is not lost to the gamma's infinity
  if (1 - value > OVERFLOW_ARGUMENT) {
    const sine = Math.sin((Math.PI * value) / 2);
    const logMagnitude =
      value * Math.LN2 +
      (value - 1) * Math.log(Math.PI) +
      Math.log(Math.abs(sine)) +
      computeLogGamma(1 - value) +
      Math.log(computeSummedZeta(1 - value));
    return Math.sign(sine) * Math.exp(logMagnitude);
  }

  return (
    2 ** value *
    Math.PI ** (value - 1) *
    Math.sin((Math.PI * value) / 2) *
    computeGamma(1 - value) *
    computeSummedZeta(1 - value)
  );
};
