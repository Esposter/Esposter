// The value `fraction` of the way through the sorted values, by nearest rank; NaN for none, so a caller sees the
// Empty set rather than a number invented for it
export const getPercentile = (values: number[], fraction: number): number => {
  if (values.length === 0) return Number.NaN;

  const sorted = values.toSorted((a, b) => a - b);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))));
  return sorted[rank] ?? Number.NaN;
};
