import type { Vector } from "#src/models/shared/Vector";

export const shift = (point: Readonly<Vector>, [x, y, z]: Readonly<Vector>): Vector => [
  point[0] + x,
  point[1] + y,
  point[2] + z,
];
