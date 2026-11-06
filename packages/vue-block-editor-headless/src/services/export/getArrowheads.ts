import type { ArrowElement } from "#src/models/ArrowElement";
import type { Point } from "#src/models/Point";

import { getArrowheadPoints } from "#src/services/export/getArrowheadPoints";
import { takeOne } from "@esposter/shared";

// The arrowheads an arrow carries along its route, one for each end that has one, each as the three corners of its head
export const getArrowheads = (arrow: ArrowElement, route: Point[]): Point[][] => {
  // A route of one point, a curve folded onto its own start, has no direction for an arrowhead to point along
  if (route.length < 2) return [];
  const lastIndex = route.length - 1;
  return [
    ...(arrow.start.hasArrowhead ? [getArrowheadPoints(takeOne(route, 0), takeOne(route, 1))] : []),
    ...(arrow.end.hasArrowhead ? [getArrowheadPoints(takeOne(route, lastIndex), takeOne(route, lastIndex - 1))] : []),
  ];
};
