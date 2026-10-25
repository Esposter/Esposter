import type { Vector } from "#src/models/shared/Vector";

import { D65_WHITE } from "#src/services/shared/constants";
import { toF } from "#src/services/shared/toF";

// A CIE XYZ colour in CIELab against the D65 white
export const toLab = ([x, y, z]: Vector): Vector => {
  const [fx, fy, fz] = [toF(x / D65_WHITE[0]), toF(y / D65_WHITE[1]), toF(z / D65_WHITE[2])];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
