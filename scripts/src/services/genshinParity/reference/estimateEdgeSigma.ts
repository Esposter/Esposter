import { findCrossing } from "#src/services/genshinParity/reference/findCrossing";
import { getEdgeLevels } from "#src/services/genshinParity/reference/getEdgeLevels";

// The 10% to 90% spread of a Gaussian edge is its sigma times twice the standard normal's 90% quantile
const SPREAD_PER_SIGMA = 2 * 1.2815515655446004;
const LOWER_LEVEL = 0.1;
const UPPER_LEVEL = 0.9;

// The Gaussian sigma of one edge read off a profile of samples across it, one per pixel: the 10% to 90% spread of its
// Rise between the profile's lowest and highest sample. A falling edge reads the same as a rising one, and a profile
// With no range to rise across has no edge
export const estimateEdgeSigma = (profile: readonly number[]): number | undefined => {
  const low = Math.min(...profile);
  const range = Math.max(...profile) - low;
  if (range === 0) return undefined;
  const levels = getEdgeLevels(profile, low, range);
  const lower = findCrossing(levels, LOWER_LEVEL);
  const upper = findCrossing(levels, UPPER_LEVEL);
  if (lower === undefined || upper === undefined || upper <= lower) return undefined;
  return (upper - lower) / SPREAD_PER_SIGMA;
};
