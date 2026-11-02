import type { Bounds } from "#src/models/Bounds";
import type { Point } from "#src/models/Point";

// The smallest box that holds every point. One pass, since a stroke holds as many points as the pointer took and a spread of them into Math.min would overflow the call stack
export const getPointsBounds = (points: Point[]): Bounds => {
  let minimumX = Infinity;
  let minimumY = Infinity;
  let maximumX = -Infinity;
  let maximumY = -Infinity;
  for (const { x, y } of points) {
    minimumX = Math.min(minimumX, x);
    minimumY = Math.min(minimumY, y);
    maximumX = Math.max(maximumX, x);
    maximumY = Math.max(maximumY, y);
  }
  return { height: maximumY - minimumY, width: maximumX - minimumX, x: minimumX, y: minimumY };
};
