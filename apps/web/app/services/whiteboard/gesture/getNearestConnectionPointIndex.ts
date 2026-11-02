import type { Bounds, Point } from "headless-block-editor";

import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { getEdgeMidpoints } from "headless-block-editor";

// The index of the connection point nearest a point, numbered as the core numbers a shape's connection points
export const getNearestConnectionPointIndex = (bounds: Bounds, point: Point): number => {
  const distances = getEdgeMidpoints(bounds).map((connectionPoint) => getPointDistance(point, connectionPoint));
  return distances.indexOf(Math.min(...distances));
};
