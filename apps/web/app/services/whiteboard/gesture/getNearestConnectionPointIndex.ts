import type { Bounds, Point } from "vue-block-editor-headless";

import { getPointDistance } from "@/services/whiteboard/gesture/getPointDistance";
import { getEdgeMidpoints } from "vue-block-editor-headless";

// The index of the connection point nearest a point, numbered as the core numbers a shape's connection points
export const getNearestConnectionPointIndex = (bounds: Bounds, point: Point): number => {
  const distances = getEdgeMidpoints(bounds).map((connectionPoint) => getPointDistance(point, connectionPoint));
  return distances.indexOf(Math.min(...distances));
};
