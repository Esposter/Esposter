import type { Vector } from "#src/models/shared/Vector";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

export const computeVectorMean = (vectors: readonly Vector[]): Vector =>
  ([0, 1, 2] as const).map((channel) =>
    roundFitted(vectors.reduce((sum, vector) => sum + vector[channel], 0) / Math.max(vectors.length, 1)),
  ) as Vector;
