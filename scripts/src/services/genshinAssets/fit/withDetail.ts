import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";
import type { ReadSurface } from "#src/models/genshinAssets/fit/ReadSurface";

import { averageSurfaceDetails } from "#src/services/genshinAssets/fit/averageSurfaceDetails";
import { sumWeights } from "#src/services/genshinAssets/fit/sumWeights";

// A surface's detail as the mean of its reads' details, each weighted by the area it covers, or the surface itself when
// None drew a texture over a covered face
export const withDetail = <Surface extends FittedSurface>(surface: Surface, reads: readonly ReadSurface[]): Surface => {
  const detail = averageSurfaceDetails(
    reads.flatMap((read) => (read.detail ? [{ detail: read.detail, weight: sumWeights(read.samples) }] : [])),
  );
  return detail === undefined ? surface : { ...surface, detail };
};
