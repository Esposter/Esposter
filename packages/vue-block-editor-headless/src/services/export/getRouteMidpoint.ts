import type { Point } from "#src/models/Point";

import { takeOne } from "@esposter/shared";

// The point halfway along a route's length, found on the segment the halfway mark falls within
export const getRouteMidpoint = (route: Point[]): Point => {
  const segments = route.slice(1).map((end, index) => ({ end, start: takeOne(route, index) }));
  const segmentLengths = segments.map(({ end, start }) => Math.hypot(end.x - start.x, end.y - start.y));
  let remaining = segmentLengths.reduce((total, length) => total + length, 0) / 2;
  for (const [index, { end, start }] of segments.entries()) {
    const length = takeOne(segmentLengths, index);
    if (remaining <= length) {
      const ratio = length ? remaining / length : 0;
      return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio };
    }

    remaining -= length;
  }
  return takeOne(route, route.length - 1);
};
