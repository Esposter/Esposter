import type { Vector } from "#src/models/shared/Vector";

import { MathUtils } from "three";

export const toAngles = ([x, y, z]: Readonly<Vector>): number[] => [
  MathUtils.radToDeg(Math.atan2(z, x)),
  MathUtils.radToDeg(Math.asin(y / Math.hypot(x, y, z))),
];
