import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { ShapeElement } from "#src/models/ShapeElement";
import type { TextElement } from "#src/models/TextElement";

import { CornerStyle } from "#src/models/CornerStyle";
import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { getTextLineHeight } from "#src/services/export/getTextLineHeight";
import { getHitElementIndex } from "#src/services/getHitElementIndex";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getHitElementIndex, () => {
  const DIAMOND_ID = v7();

  test("a click on a diamond's edge hits it and its corner misses", () => {
    expect.hasAssertions();

    const diamond: ShapeElement = {
      color: "",
      cornerStyle: CornerStyle.Sharp,
      dashPattern: DashPattern.Solid,
      fill: "#000000",
      height: 100,
      id: DIAMOND_ID,
      kind: ShapeKind.Diamond,
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.Shape,
      width: 100,
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [diamond] };

    // The edge from the top point to the right point passes through (75, 25)
    expect(getHitElementIndex(document, { x: 75, y: 25 }, 0)).toBe(0);
    // The top-left corner of the bounding box lies outside the diamond
    expect(getHitElementIndex(document, { x: 0, y: 0 }, 0)).toBeUndefined();
  });

  test("a text box is hit across the line its text wraps to, and misses below it", () => {
    expect.hasAssertions();

    const textElement: TextElement = {
      color: "",
      id: v7(),
      isWrapped: true,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 100,
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textElement] };

    // A text box stores no height, so the core reads it as the one line its text wraps to, and the point one unit below that line misses
    expect(getHitElementIndex(document, { x: 0, y: getTextLineHeight(TextSize.Small) / 2 }, 0)).toBe(0);
    expect(getHitElementIndex(document, { x: 0, y: getTextLineHeight(TextSize.Small) + 1 }, 0)).toBeUndefined();
  });
});
