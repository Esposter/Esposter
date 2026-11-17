import type { Vector } from "#src/models/shared/Vector";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { mapVector } from "#src/services/shared/mapVector";

export const toShade = (mean: Vector, base: Vector): Vector =>
  mapVector((channel) => roundFitted(mean[channel] / (base[channel] || 1)));
