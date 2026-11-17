import type { Vector } from "#src/models/shared/Vector";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeMean } from "#src/services/recreation/statistics/computeMean";
import { mapVector } from "#src/services/shared/mapVector";

export const computeVectorMean = (vectors: readonly Vector[]): Vector =>
  mapVector((channel) => roundFitted(computeMean(vectors.map((vector) => vector[channel]))));
