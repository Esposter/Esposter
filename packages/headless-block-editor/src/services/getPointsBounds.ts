import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

// The smallest box that holds every point
export const getPointsBounds = (points: Point[]): Bounds => {
  const minimumX = Math.min(...points.map(({ x }) => x));
  const minimumY = Math.min(...points.map(({ y }) => y));
  const maximumX = Math.max(...points.map(({ x }) => x));
  const maximumY = Math.max(...points.map(({ y }) => y));
  return { height: maximumY - minimumY, width: maximumX - minimumX, x: minimumX, y: minimumY };
};
