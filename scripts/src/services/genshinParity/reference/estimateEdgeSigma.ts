// The 10% to 90% spread of a Gaussian edge is its sigma times twice the standard normal's 90% quantile
const SPREAD_PER_SIGMA = 2 * 1.2815515655446004;
const LOWER_LEVEL = 0.1;
const UPPER_LEVEL = 0.9;

// The place along the profile where it first reaches the level, between the two samples that straddle it
const findCrossing = (levels: readonly number[], level: number): number | undefined => {
  const index = levels.findIndex((value) => value >= level);
  if (index === -1) return undefined;
  if (index === 0) return 0;
  const before = levels[index - 1] ?? 0;
  const after = levels[index] ?? 0;
  return index - 1 + (level - before) / (after - before);
};

// The Gaussian sigma of one edge read off a profile of samples across it, one per pixel: the 10% to 90% spread of its
// Rise between the profile's lowest and highest sample. A falling edge reads the same as a rising one, and a profile
// With no range to rise across has no edge
export const estimateEdgeSigma = (profile: readonly number[]): number | undefined => {
  const low = Math.min(...profile);
  const range = Math.max(...profile) - low;
  if (range === 0) return undefined;
  const first = profile[0] ?? 0;
  const last = profile.at(-1) ?? 0;
  const levels = profile.map((value) => (last >= first ? (value - low) / range : (range - (value - low)) / range));
  const lower = findCrossing(levels, LOWER_LEVEL);
  const upper = findCrossing(levels, UPPER_LEVEL);
  if (lower === undefined || upper === undefined || upper <= lower) return undefined;
  return (upper - lower) / SPREAD_PER_SIGMA;
};
