import type { Vector } from "#src/models/shared/Vector";

export const dot = (first: Vector, second: Vector): number =>
  first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
