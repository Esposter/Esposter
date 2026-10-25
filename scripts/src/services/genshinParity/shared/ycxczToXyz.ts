import type { Vector } from "#src/models/shared/Vector";

import { D65_WHITE } from "#src/services/shared/constants";

export const ycxczToXyz = ([luminance, cx, cz]: Vector): Vector => {
  const y = (luminance + 16) / 116;
  return [(y + cx / 500) * D65_WHITE[0], y * D65_WHITE[1], (y - cz / 200) * D65_WHITE[2]];
};
