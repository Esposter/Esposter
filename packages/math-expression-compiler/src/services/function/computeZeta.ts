import { computeGamma } from "#src/services/function/computeGamma";
import { computeSummedZeta } from "#src/services/function/computeSummedZeta";

export const computeZeta = (value: number): number => {
  // The series tends to its first term as the argument grows without bound, so the zeta of plus infinity is one, as mathjs answers
  if (value === Number.POSITIVE_INFINITY) return 1;
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
