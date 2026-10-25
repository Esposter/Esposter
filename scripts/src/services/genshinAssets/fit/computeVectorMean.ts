import type { Vector } from "#src/models/shared/Vector";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { computeMean } from "#src/services/recreation/statistics/computeMean";

export const computeVectorMean = (vectors: readonly Vector[]): Vector =>
  ([0, 1, 2] as const).map((channel) => roundFitted(computeMean(vectors.map((vector) => vector[channel])))) as Vector;
