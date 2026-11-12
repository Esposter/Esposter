import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { ShapeElement } from "#src/models/ShapeElement";
import type { TextElement } from "#src/models/TextElement";

import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TEXT_LINE_HEIGHT } from "#src/services/export/constants";
import { getHitElementIndex } from "#src/services/getHitElementIndex";
import { describe, expect, test } from "vitest";

describe(getHitElementIndex, () => {
  const DIAMOND_ID = crypto.randomUUID();

  test("a click on a diamond's edge hits it and its corner misses", () => {
    expect.hasAssertions();

    const diamond: ShapeElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: "#000000",
      height: 100,
      id: DIAMOND_ID,
      kind: ShapeKind.Diamond,
      strokeWidth: StrokeWidth.Medium,
      text: "",
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
      id: crypto.randomUUID(),
      text: "",
      type: PositionedElementType.Text,
      width: 100,
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textElement] };

    // A text box stores no height, so the core reads it as the one line its text wraps to, and the point one unit below that line misses
    expect(getHitElementIndex(document, { x: 0, y: TEXT_LINE_HEIGHT / 2 }, 0)).toBe(0);
    expect(getHitElementIndex(document, { x: 0, y: TEXT_LINE_HEIGHT + 1 }, 0)).toBeUndefined();
  });
});
