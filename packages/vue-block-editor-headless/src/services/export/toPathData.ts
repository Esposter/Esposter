import type { Point } from "#src/models/Point";

// The path data of a polyline: a move to its first point, then a line to each point after it
export const toPathData = (points: Point[]): string =>
  points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
