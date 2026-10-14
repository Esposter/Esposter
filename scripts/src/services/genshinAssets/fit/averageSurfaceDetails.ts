import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";

import { computeWeightedMean } from "#src/services/genshinAssets/fit/computeWeightedMean";

// The mean of several surfaces' details, their texel sizes too, each weighted by the area it was sampled over,
// Undefined when none is given or none was sampled over any area
export const averageSurfaceDetails = (
  details: readonly { detail: SurfaceDetail; weight: number }[],
): SurfaceDetail | undefined => {
  const [first] = details;
  const totalWeight = details.reduce((sum, { weight }) => sum + weight, 0);
  if (!first || totalWeight <= 0) return undefined;
  return {
    bands: first.detail.bands.map((_band, index) =>
      computeWeightedMean(details.map(({ detail: { bands }, weight }) => ({ value: bands[index] ?? 0, weight }))),
    ),
    metresPerTexel: computeWeightedMean(
      details.map(({ detail: { metresPerTexel }, weight }) => ({ value: metresPerTexel, weight })),
    ),
    variance: computeWeightedMean(details.map(({ detail: { variance }, weight }) => ({ value: variance, weight }))),
  };
};
