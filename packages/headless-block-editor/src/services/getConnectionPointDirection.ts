import type { Point } from "#src/models/Point";

// The unit direction a connection point points out of its shape, in the order the points are numbered: up, right, down, left
export const getConnectionPointDirection = (connectionPointIndex: number): Point | undefined =>
  [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ].at(connectionPointIndex);
