import type { Vector } from "#src/models/shared/Vector";

// The squared distance between two vectors, which a clustering compares without taking a root
export const computeSquaredDistance = ([firstX, firstY, firstZ]: Vector, [secondX, secondY, secondZ]: Vector): number =>
  (firstX - secondX) ** 2 + (firstY - secondY) ** 2 + (firstZ - secondZ) ** 2;
