import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";
import type { TextElement } from "#src/models/TextElement";

import { DashPattern } from "#src/models/DashPattern";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { SketchLevel } from "#src/models/SketchLevel";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { TextSize } from "#src/models/TextSize";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { resizePositionedElement } from "#src/services/resizePositionedElement";
import { JsonPatchOperationType } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(resizePositionedElement, () => {
  test("resizing a shape reroutes its bound arrows in the same edit", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = resizePositionedElement(document, 0, { height: 100, width: 200 });
    const resizedDocument = applyPositionedEdit(document, operations);

    // The bottom point of a 200 wide shape is at x 100
    expect(resizedDocument).toStrictEqual({
      elements: [
        { ...POSITIONED_RECTANGLE, width: 200 },
        { ...POSITIONED_ARROW, start: { ...POSITIONED_ARROW.start, point: { x: 100, y: 100 } } },
      ],
    });
  });

  test("a text box resized by size takes its width only", () => {
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
    const operations = resizePositionedElement({ elements: [textElement] }, 0, { height: 99, width: 50 });

    expect(operations).toStrictEqual([{ op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 50 }]);
  });

  test("a sticky note resized by size takes its width and height", () => {
    expect.hasAssertions();

    const stickyNote: StickyNoteElement = {
      color: "",
      dashPattern: DashPattern.Solid,
      fill: "#ffffff",
      height: 100,
      id: crypto.randomUUID(),
      sketchLevel: SketchLevel.Artist,
      strokeWidth: StrokeWidth.Medium,
      text: "",
      textSize: TextSize.Small,
      type: PositionedElementType.StickyNote,
      width: 100,
      x: 0,
      y: 0,
    };
    const operations = resizePositionedElement({ elements: [stickyNote] }, 0, { height: 80, width: 120 });

    expect(operations).toStrictEqual([
      { op: JsonPatchOperationType.Replace, path: "/elements/0/width", value: 120 },
      { op: JsonPatchOperationType.Replace, path: "/elements/0/height", value: 80 },
    ]);
  });

  test("an arrow is not resized", () => {
    expect.hasAssertions();

    expect(resizePositionedElement({ elements: [POSITIONED_ARROW] }, 0, { height: 80, width: 80 })).toStrictEqual([]);
  });

  test("a width handle on an auto width text box sets it back to a wrapped width at the dragged width", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "abcd",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("abcd", TextSize.Small),
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textBox] };
    const editedDocument = applyPositionedEdit(
      document,
      resizePositionedElement(document, 0, { height: 100, width: 120 }),
    );

    expect(editedDocument?.elements).toStrictEqual([{ ...textBox, isWrapped: true, width: 120 }]);
  });
});
