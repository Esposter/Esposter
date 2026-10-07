import type { Vector } from "#src/models/shared/Vector";

import { D65_WHITE } from "#src/services/shared/constants";

const DELTA = 6 / 29;
// The standard's cube root, joined near black to a linear segment
const toF = (value: number): number => (value > DELTA ** 3 ? Math.cbrt(value) : value / (3 * DELTA ** 2) + 4 / 29);
// A CIE XYZ colour in CIELab against the D65 white
export const toLab = ([x, y, z]: Vector): Vector => {
  const [fx, fy, fz] = [toF(x / D65_WHITE[0]), toF(y / D65_WHITE[1]), toF(z / D65_WHITE[2])];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
