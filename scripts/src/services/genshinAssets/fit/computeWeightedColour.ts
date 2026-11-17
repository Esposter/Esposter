import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Vector } from "#src/models/shared/Vector";

import { computeWeightedMean } from "#src/services/genshinAssets/fit/computeWeightedMean";
import { mapVector } from "#src/services/shared/mapVector";

export const computeWeightedColour = (samples: readonly SurfaceSample[]): Vector =>
  mapVector((channel) =>
    computeWeightedMean(samples.map(({ colour, weight }) => ({ value: colour[channel] ?? 0, weight }))),
  );
