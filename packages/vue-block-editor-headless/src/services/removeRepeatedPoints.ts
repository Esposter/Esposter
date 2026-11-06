import type { Point } from "#src/models/Point";

import { checkIsSamePoint } from "#src/services/checkIsSamePoint";
import { takeOne } from "@esposter/shared";

// Drops each point that repeats the one before it, so a route with an empty leg has no zero-length segment
export const removeRepeatedPoints = (points: Point[]): Point[] =>
  points.filter((point, index) => index === 0 || !checkIsSamePoint(point, takeOne(points, index - 1)));
