import type { ArrowElement } from "#src/models/ArrowElement";
import type { ShapeElement } from "#src/models/ShapeElement";

import { ArrowheadKind } from "#src/models/ArrowheadKind";
import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { CornerStyle } from "#src/models/CornerStyle";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { DOTTED_STROKE_DASH_LENGTH, STROKE_DASH_LENGTH, STROKE_GAP_LENGTH } from "#src/services/export/constants";
import { getStrokeAttributes } from "#src/services/export/getStrokeAttributes";
import { toArrowSvg } from "#src/services/export/toArrowSvg";
import { toElementTextSvg } from "#src/services/export/toElementTextSvg";
import { toShapeSvg } from "#src/services/export/toShapeSvg";
import { describe, expect, test } from "vitest";

// The value of the first attribute of this name the SVG writes, which is the outline or route the element draws before its heads and text
const readAttribute = (svg: string, name: string): string | undefined =>
  new RegExp(`${name}="([^"]*)"`, "u").exec(svg)?.[1];

describe(getStrokeAttributes, () => {
  const SHAPE: ShapeElement = {
    color: "",
    cornerStyle: CornerStyle.Sharp,
    dashPattern: DashPattern.Solid,
    fill: "#ffffff",
    height: 100,
    id: crypto.randomUUID(),
    kind: ShapeKind.Process,
    sketchLevel: SketchLevel.Artist,
    strokeWidth: StrokeWidth.Medium,
    text: "Review",
    textSize: TextSize.Small,
    type: PositionedElementType.Shape,
    width: 100,
    x: 0,
    y: 0,
  };

  test("a chosen colour draws the outline and the text", () => {
    expect.hasAssertions();

    const shape: ShapeElement = { ...SHAPE, color: "#ff0000" };

    expect(readAttribute(toShapeSvg(shape), "stroke")).toBe("#ff0000");
    expect(readAttribute(toElementTextSvg(shape), "fill")).toBe("#ff0000");
  });

  test("an element with no colour draws in the page text colour", () => {
    expect.hasAssertions();

    expect(getStrokeAttributes(SHAPE, "currentColor").stroke).toBe("currentColor");
    expect(readAttribute(toShapeSvg(SHAPE), "stroke")).toBe("#1e1e1e");
  });

  test("a bold width draws the outline and the export at bold", () => {
    expect.hasAssertions();

    expect(readAttribute(toShapeSvg({ ...SHAPE, strokeWidth: StrokeWidth.Bold }), "stroke-width")).toBe("4");
  });

  test("a dashed outline draws with gaps on the canvas and in the export", () => {
    expect.hasAssertions();

    const dashedShape: ShapeElement = { ...SHAPE, dashPattern: DashPattern.Dashed };

    expect(readAttribute(toShapeSvg(dashedShape), "stroke-dasharray")).toBe(
      `${STROKE_DASH_LENGTH} ${STROKE_GAP_LENGTH}`,
    );
    expect(readAttribute(toShapeSvg(SHAPE), "stroke-dasharray")).toBeUndefined();
  });

  test("an arrow route draws dotted when the owner chooses dotted", () => {
    expect.hasAssertions();

    const arrow: ArrowElement = {
      color: "",
      dashPattern: DashPattern.Dotted,
      end: { arrowhead: ArrowheadKind.Triangle, point: { x: 100, y: 0 } },
      id: crypto.randomUUID(),
      label: "",
      pathKind: ArrowPathKind.Straight,
      start: { point: { x: 0, y: 0 } },
      strokeWidth: StrokeWidth.Medium,
      textSize: TextSize.Small,
      type: PositionedElementType.Arrow,
    };
    const svg = toArrowSvg(arrow);

    expect(readAttribute(svg, "stroke-dasharray")).toBe(`${DOTTED_STROKE_DASH_LENGTH} ${STROKE_GAP_LENGTH}`);
    expect(readAttribute(svg, "stroke-linecap")).toBe("round");
    // The arrowhead is a filled polygon, which no dash pattern reaches
    expect(/<polygon[^>]*stroke-dasharray/u.test(svg)).toBe(false);
    expect(/<polygon[^>]*fill="#1e1e1e"/u.test(svg)).toBe(true);
  });
});
