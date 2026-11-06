import type { Point } from "#src/models/Point";

// The points attribute of a polygon: each corner's coordinates, separated by spaces
export const toPolygonPoints = (points: Point[]): string => points.map(({ x, y }) => `${x},${y}`).join(" ");
