import type { Vector } from "#src/models/shared/Vector";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

export const toShade = (mean: Vector, base: Vector): Vector =>
  ([0, 1, 2] as const).map((channel) => roundFitted(mean[channel] / (base[channel] || 1))) as Vector;
