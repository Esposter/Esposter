import type { Vector } from "#src/models/shared/Vector";

import { D65_WHITE } from "#src/services/shared/constants";

export const xyzToYcxcz = ([x, y, z]: Vector): Vector => {
  const [nx, ny, nz] = [x / D65_WHITE[0], y / D65_WHITE[1], z / D65_WHITE[2]];
  return [116 * ny - 16, 500 * (nx - ny), 200 * (ny - nz)];
};
