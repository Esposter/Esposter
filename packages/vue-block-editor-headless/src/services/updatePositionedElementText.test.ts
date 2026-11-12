import type { ImageElement } from "#src/models/ImageElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { TextElement } from "#src/models/TextElement";

import { PositionedElementType } from "#src/models/PositionedElementType";
import { TextSize } from "#src/models/TextSize";
import { getTextWidth } from "#src/services/export/getTextWidth";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { updatePositionedElementText } from "#src/services/updatePositionedElementText";
import { describe, expect, test } from "vitest";

describe(updatePositionedElementText, () => {
  const EDITED_TEXT = " ";

  test("editing a shape's text replaces the text and leaves the shape in place", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = updatePositionedElementText(document, 0, EDITED_TEXT);
    const editedDocument = applyPositionedEdit(document, operations);

    expect(editedDocument).toStrictEqual({
      elements: [{ ...POSITIONED_RECTANGLE, text: EDITED_TEXT }, POSITIONED_ARROW],
    });
  });

  test("editing an arrow's label replaces the label and leaves the arrow's ends in place", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = updatePositionedElementText(document, 1, EDITED_TEXT);
    const editedDocument = applyPositionedEdit(document, operations);

    expect(editedDocument).toStrictEqual({
      elements: [POSITIONED_RECTANGLE, { ...POSITIONED_ARROW, label: EDITED_TEXT }],
    });
  });

  test("an image holds no text, so editing it writes no operations", () => {
    expect.hasAssertions();

    const image: ImageElement = {
      altText: "",
      fileId: "0".repeat(64),
      height: 100,
      id: crypto.randomUUID(),
      type: PositionedElementType.Image,
      width: 100,
      x: 0,
      y: 0,
    };

    expect(updatePositionedElementText({ elements: [image] }, 0, EDITED_TEXT)).toStrictEqual([]);
  });

  test("an unwrapped text box is as wide as its new widest line, in the same edit", () => {
    expect.hasAssertions();

    const textBox: TextElement = {
      color: "",
      id: crypto.randomUUID(),
      isWrapped: false,
      text: "a",
      textSize: TextSize.Small,
      type: PositionedElementType.Text,
      width: getTextWidth("a", TextSize.Small),
      x: 0,
      y: 0,
    };
    const document: PositionedDocument = { elements: [textBox] };
    const editedDocument = applyPositionedEdit(document, updatePositionedElementText(document, 0, "ab\nabcd"));

    expect(editedDocument?.elements).toStrictEqual([
      { ...textBox, text: "ab\nabcd", width: getTextWidth("abcd", TextSize.Small) },
    ]);
  });
});
