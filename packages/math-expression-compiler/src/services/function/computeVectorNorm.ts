import { checkIsLarger } from "#src/services/function/checkIsLarger";
import { checkIsNearlyEqual } from "#src/services/function/checkIsNearlyEqual";
import { checkIsSmaller } from "#src/services/function/checkIsSmaller";
import { computeExtreme } from "#src/services/function/computeExtreme";
import { computeSum } from "#src/services/function/computeSum";

// The norm of a vector for a power: its largest magnitude for an infinite power and its smallest for minus infinity.
// Each is folded from the first magnitude as mathjs's max and min fold.
// Otherwise it is the power of the sum of the magnitudes' powers.
// A power nearly zero is an infinite norm, as mathjs reads it
export const computeVectorNorm = (values: readonly number[], power: number): null | number => {
  if (Number.isNaN(power)) return null;

  const magnitudes = values.map((value) => Math.abs(value));
  if (Math.abs(power) === Number.POSITIVE_INFINITY) {
    const [first] = magnitudes;
    if (first === undefined) return 0;
    return computeExtreme(magnitudes, first, power > 0 ? checkIsLarger : checkIsSmaller);
  }
  if (checkIsNearlyEqual(power, 0)) return Number.POSITIVE_INFINITY;

  const total = computeSum(magnitudes.map((magnitude) => magnitude ** power));
  return total ** (1 / power);
};
