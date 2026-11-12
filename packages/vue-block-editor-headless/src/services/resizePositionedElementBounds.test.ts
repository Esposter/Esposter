import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { TextElement } from "#src/models/TextElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { TextSize } from "#src/models/TextSize";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { resizePositionedElementBounds } from "#src/services/resizePositionedElementBounds";
import { JsonPatchOperationType } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(resizePositionedElementBounds, () => {
  test("resizing from the top-left reroutes bound arrows in the same edit", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = resizePositionedElementBounds(document, 0, { height: 80, width: 80, x: 20, y: 20 });
    const resizedDocument = applyPositionedEdit(document, operations);

    // The bottom point of the 80 wide shape is at x 60, and its bottom edge stays at y 100
    expect(resizedDocument).toStrictEqual({
      elements: [
        { ...POSITIONED_RECTANGLE, height: 80, width: 80, x: 20, y: 20 },
        { ...POSITIONED_ARROW, start: { ...POSITIONED_ARROW.start, point: { x: 60, y: 100 } } },
      ],
    });
  });

  test("a text box resized by bounds takes its x, y and width only", () => {
    expect.hasAssertions();

    const textElement: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: true,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: 100,
      x: 0,
      y: 0,
    };
    const operations = resizePositionedElementBounds({ elements: [textElement] }, 0, {
      height: 99,
      width: 50,
      x: 10,
      y: 20,
    });

    expect(operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/x", value: 10 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/y", value: 20 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 50 },
    ]);
  });
});
