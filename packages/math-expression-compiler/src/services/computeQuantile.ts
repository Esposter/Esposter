// The quantile of a list at a probability between zero and one, interpolated between the two values it falls between.
// A list given as sorted is read in its order, else it is sorted first, as mathjs reads it. An empty list has no quantile
export const computeQuantile = (values: number[], probability: number, isSorted: boolean): null | number => {
  if (values.length === 0 || probability < 0 || probability > 1) return null;

  const ordered = isSorted ? values : values.toSorted((left, right) => left - right);
  const index = probability * (ordered.length - 1);
  const integerPart = Math.floor(index);
  if (Number.isInteger(index)) return ordered[integerPart] ?? Number.NaN;

  const fraction = index % 1;
  return (ordered[integerPart] ?? Number.NaN) * (1 - fraction) + (ordered[integerPart + 1] ?? Number.NaN) * fraction;
};
