import type { Point } from "#src/models/Point";

import { takeOne } from "@esposter/shared";

// The distance between two points
const getDistance = (start: Point, end: Point): number => Math.hypot(end.x - start.x, end.y - start.y);

// The point a distance along the segment from one point toward another, or the start itself when the two coincide
const getPointAlong = (start: Point, end: Point, distance: number): Point => {
  const length = getDistance(start, end);
  if (length === 0) return start;
  return { x: start.x + ((end.x - start.x) * distance) / length, y: start.y + ((end.y - start.y) * distance) / length };
};

// The path data of a closed outline with each corner curved by a quadratic curve whose control is the corner. A corner's radius is the one given, cut to
// Half of either side it joins, so two curves never overlap on a short side
export const toRoundedPathData = (points: Point[], radius: number): string => {
  const curves = points.map((corner, index) => {
    const previous = takeOne(points, (index + points.length - 1) % points.length);
    const next = takeOne(points, (index + 1) % points.length);
    const cornerRadius = Math.min(radius, getDistance(corner, previous) / 2, getDistance(corner, next) / 2);
    const entry = getPointAlong(corner, previous, cornerRadius);
    const exit = getPointAlong(corner, next, cornerRadius);
    return `${index === 0 ? "M" : "L"}${entry.x} ${entry.y} Q${corner.x} ${corner.y} ${exit.x} ${exit.y}`;
  });
  return `${curves.join(" ")} Z`;
};
