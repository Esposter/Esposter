// The norm of a vector for a power: its largest or smallest magnitude for an infinite power, else the power of its sum of
// The powers of the magnitudes, the zero magnitudes skipped as mathjs skips them. A zero power is an infinite norm
export const computeVectorNorm = (values: number[], power: number): null | number => {
  if (Number.isNaN(power)) return null;

  const magnitudes = values.map((value) => Math.abs(value)).filter((magnitude) => magnitude !== 0);
  if (power === Number.POSITIVE_INFINITY)
    return magnitudes.reduce((largest, magnitude) => Math.max(largest, magnitude), 0);
  if (power === Number.NEGATIVE_INFINITY) return magnitudes.length === 0 ? 0 : Math.min(...magnitudes);
  if (power === 0) return Number.POSITIVE_INFINITY;

  const total = magnitudes.reduce((sum, magnitude) => magnitude ** power + sum, 0);
  return total ** (1 / power);
};
