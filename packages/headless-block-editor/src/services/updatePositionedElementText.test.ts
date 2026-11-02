import type { ImageElement } from "#src/models/ImageElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";

import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { updatePositionedElementText } from "#src/services/updatePositionedElementText";
import { describe, expect, test } from "vitest";

describe(updatePositionedElementText, () => {
  const EDITED_TEXT = " ";

  test("editing a shape's text replaces the text and leaves the shape in place", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = updatePositionedElementText(document, 0, EDITED_TEXT);
    const editedDocument = applyBlockEdit(positionedDocumentSchema, document, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(editedDocument).toStrictEqual({
      elements: [{ ...POSITIONED_RECTANGLE, text: EDITED_TEXT }, POSITIONED_ARROW],
    });
  });

  test("editing an arrow's label replaces the label and leaves the arrow's ends in place", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = updatePositionedElementText(document, 1, EDITED_TEXT);
    const editedDocument = applyBlockEdit(positionedDocumentSchema, document, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(editedDocument).toStrictEqual({
      elements: [POSITIONED_RECTANGLE, { ...POSITIONED_ARROW, label: EDITED_TEXT }],
    });
  });

  test("an image holds no text, so editing it writes no operations", () => {
    expect.hasAssertions();

    const image: ImageElement = {
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
});
