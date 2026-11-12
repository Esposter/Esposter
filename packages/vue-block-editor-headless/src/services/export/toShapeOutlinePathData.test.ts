import type { ShapeElement } from "#src/models/ShapeElement";

import { CornerStyle } from "#src/models/CornerStyle";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { toShapeOutlinePathData } from "#src/services/export/toShapeOutlinePathData";
import { toShapeSvg } from "#src/services/export/toShapeSvg";
import { describe, expect, test } from "vitest";

// A rectangle at the origin with its corners set and its sketch at the level given, so its outline has exact corners to check
const createRectangle = (
  width: number,
  height: number,
  cornerStyle: CornerStyle,
  sketchLevel: SketchLevel,
): ShapeElement => ({
  color: "",
  cornerStyle,
  dashPattern: DashPattern.Solid,
  fill: "#ffffff",
  height,
  id: crypto.randomUUID(),
  kind: ShapeKind.Rectangle,
  sketchLevel,
  strokeWidth: StrokeWidth.Medium,
  text: "",
  type: PositionedElementType.Shape,
  width,
  x: 0,
  y: 0,
});

// The path data a shape's export writes, so a test can compare the export with the outline
const readExportedPath = (shape: ShapeElement): string | undefined =>
  /<path d="(?<path>[^"]*)"/u.exec(toShapeSvg(shape))?.groups?.path;

describe(toShapeOutlinePathData, () => {
  test("round corners curve the outline", () => {
    expect.hasAssertions();

    const sharpRectangle = createRectangle(200, 200, CornerStyle.Sharp, SketchLevel.Architect);
    const roundRectangle = createRectangle(200, 200, CornerStyle.Round, SketchLevel.Architect);

    expect(toShapeOutlinePathData(sharpRectangle)).not.toContain("Q");
    expect(toShapeOutlinePathData(roundRectangle)).toContain("Q");
    expect(readExportedPath(roundRectangle)).toBe(toShapeOutlinePathData(roundRectangle));
  });

  test("a round corner stops growing at the limit", () => {
    expect.hasAssertions();

    // Each path starts on the left edge, at the radius its corner curves by, so the start shows how far a corner has grown
    const getStartOfCurve = (width: number, height: number): string | undefined =>
      toShapeOutlinePathData(createRectangle(width, height, CornerStyle.Round, SketchLevel.Architect)).split(" Q")[0];

    expect(getStartOfCurve(40, 40)).toBe("M0 10");
    expect(getStartOfCurve(200, 200)).toBe("M0 12");
    expect(getStartOfCurve(400, 400)).toBe("M0 12");
  });

  test("an ellipse is not rounded, whatever its corner style", () => {
    expect.hasAssertions();

    const ellipse: ShapeElement = {
      ...createRectangle(200, 200, CornerStyle.Round, SketchLevel.Architect),
      kind: ShapeKind.Ellipse,
    };

    expect(toShapeOutlinePathData(ellipse)).not.toContain("Q");
  });
});
