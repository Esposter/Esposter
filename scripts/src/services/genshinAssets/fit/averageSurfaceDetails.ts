import type { SurfaceDetail } from "#src/models/genshinAssets/fit/SurfaceDetail";

// The mean of several surfaces' details, their texel sizes too, each weighted by the area it was sampled over,
// Undefined when none is given or none was sampled over any area
export const averageSurfaceDetails = (
  details: readonly { detail: SurfaceDetail; weight: number }[],
): SurfaceDetail | undefined => {
  const [first] = details;
  const totalWeight = details.reduce((sum, { weight }) => sum + weight, 0);
  if (!first || totalWeight <= 0) return undefined;
  return {
    bands: first.detail.bands.map(
      (_band, index) =>
        details.reduce((sum, { detail: { bands }, weight }) => sum + (bands[index] ?? 0) * weight, 0) / totalWeight,
    ),
    metresPerTexel:
      details.reduce((sum, { detail: { metresPerTexel }, weight }) => sum + metresPerTexel * weight, 0) / totalWeight,
    variance: details.reduce((sum, { detail: { variance }, weight }) => sum + variance * weight, 0) / totalWeight,
  };
};
