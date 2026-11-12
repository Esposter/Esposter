import type { Point } from "#src/models/Point";

import { SketchLevel } from "#src/models/SketchLevel";
import { getSketchedPoints } from "#src/services/export/getSketchedPoints";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(getSketchedPoints, () => {
  const points: Point[] = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  // The farthest any point of an outline moves from where its box put it
  const getMaximumOffset = (sketchedPoints: Point[]): number =>
    Math.max(
      ...sketchedPoints.map((sketchedPoint, index) => Math.abs(sketchedPoint.x - takeOne(points, index).x)),
      ...sketchedPoints.map((sketchedPoint, index) => Math.abs(sketchedPoint.y - takeOne(points, index).y)),
    );

  test("architect draws a shape with straight edges", () => {
    expect.hasAssertions();

    expect(getSketchedPoints(points, "shape", SketchLevel.Architect)).toStrictEqual(points);
  });

  test("cartoonist draws a larger offset than artist", () => {
    expect.hasAssertions();

    const artistOffset = getMaximumOffset(getSketchedPoints(points, "shape", SketchLevel.Artist));
    const cartoonistOffset = getMaximumOffset(getSketchedPoints(points, "shape", SketchLevel.Cartoonist));

    expect(artistOffset).toBeGreaterThan(0);
    expect(cartoonistOffset).toBeGreaterThan(artistOffset);
  });
});
