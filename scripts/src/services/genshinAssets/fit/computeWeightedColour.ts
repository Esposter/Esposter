import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Vector } from "#src/models/shared/Vector";

import { computeWeightedMean } from "#src/services/genshinAssets/fit/computeWeightedMean";

export const computeWeightedColour = (samples: readonly SurfaceSample[]): Vector =>
  ([0, 1, 2] as const).map((channel) =>
    computeWeightedMean(samples.map(({ colour, weight }) => ({ value: colour[channel] ?? 0, weight }))),
  ) as Vector;
