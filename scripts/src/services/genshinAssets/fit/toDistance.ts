import type { Vector } from "#src/models/shared/Vector";

export const toDistance = (first: Readonly<Vector>, second: Readonly<Vector>): number =>
  Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
