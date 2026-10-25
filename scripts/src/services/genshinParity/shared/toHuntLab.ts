import type { Vector } from "#src/models/shared/Vector";

import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";

export const toHuntLab = (linear: Vector): Vector => {
  const [l, a, b] = toLab(toXyz(linear));
  return [l, 0.01 * l * a, 0.01 * l * b];
};
