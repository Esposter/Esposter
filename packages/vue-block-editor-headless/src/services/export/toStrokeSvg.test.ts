import type { StrokeElement } from "#src/models/StrokeElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { strokeElementSchema } from "#src/models/StrokeElement";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { toStrokeSvg } from "#src/services/export/toStrokeSvg";
import { describe, expect, test } from "vitest";

// The path data of a freehand stroke's SVG, so a test can read the curve the export draws
const readStrokePath = (stroke: StrokeElement): string | undefined =>
  /<path d="(?<path>[^"]*)"/u.exec(toStrokeSvg(stroke))?.groups?.path;

describe(toStrokeSvg, () => {
  // A stroke with a quick turn at its middle point, which a polyline would draw as a corner
  const stroke: StrokeElement = {
    color: "",
    id: crypto.randomUUID(),
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ],
    strokeWidth: StrokeWidth.Medium,
    type: PositionedElementType.Stroke,
  };

  test("a freehand stroke draws smoothed", () => {
    expect.hasAssertions();

    // The curve bends through the turn's point, and ends at the last point after the midpoint of the last segment
    expect(readStrokePath(stroke)).toBe("M0 0 Q100 0 100 50 L100 100");
  });

  test("a stroke saved before the change draws smoothed", () => {
    expect.hasAssertions();

    const savedStroke = strokeElementSchema.parse({
      color: "",
      id: stroke.id,
      points: stroke.points,
      strokeWidth: StrokeWidth.Medium,
      type: PositionedElementType.Stroke,
    });

    expect(savedStroke.points).toStrictEqual(stroke.points);
    expect(readStrokePath(savedStroke)).toBe("M0 0 Q100 0 100 50 L100 100");
  });
});
