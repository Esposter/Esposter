import type { Vector } from "#src/models/shared/Vector";

import { toLab } from "#src/services/shared/toLab";
import { toXyz } from "#src/services/shared/toXyz";

// The mean of a sum of linear colours over so many pixels, in CIELab
export const toMeanLab = (sum: Vector, count: number): Vector => {
  const [red = 0, green = 0, blue = 0] = sum.map((channelSum) => channelSum / Math.max(count, 1));
  return toLab(toXyz([red, green, blue]));
};
