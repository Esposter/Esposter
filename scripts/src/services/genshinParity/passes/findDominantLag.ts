// The lag of the strongest positive lobe of an autocorrelation, after it first falls to zero: the dominant spacing of a
// Field's variation, in samples. The first lag that reaches the strongest value wins, so a periodic field reads its
// Period rather than its multiples. None where the correlation never falls to zero, never turns positive again, or
// Peaks at its last lag, since then no lobe is resolved within the range read
export const findDominantLag = (correlation: readonly number[]): number | undefined => {
  let lag = 1;
  while (lag < correlation.length && (correlation[lag] ?? 0) > 0) lag++;
  const lobe = correlation.slice(lag);
  const strongest = Math.max(0, ...lobe);
  if (strongest <= 0) return undefined;
  const found = lobe.findIndex((value) => value >= strongest - 1e-9);
  const peak = lag + found;
  return peak >= correlation.length - 1 ? undefined : peak;
};
