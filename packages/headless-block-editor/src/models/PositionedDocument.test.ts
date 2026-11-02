import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";

import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { getElementBounds } from "#src/services/getElementBounds";
import {
  POSITIONED_FREE_ARROW,
  POSITIONED_FREE_ARROW_ID,
  POSITIONED_RECTANGLE,
  POSITIONED_RECTANGLE_ID,
} from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe("positionedDocumentSchema", () => {
  test("a document of typed elements parses with bounds and z-order", () => {
    expect.hasAssertions();

    const stickyNoteId = crypto.randomUUID();
    const stickyNote: StickyNoteElement = {
      fill: "#000000",
      height: 80,
      id: stickyNoteId,
      text: "",
      type: PositionedElementType.StickyNote,
      width: 80,
      x: 300,
      y: 0,
    };
    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW, stickyNote] };
    const parsedDocument = positionedDocumentSchema.parse(document);

    expect(parsedDocument).toStrictEqual(document);
    expect(parsedDocument.elements.map((element) => getElementBounds(element))).toStrictEqual([
      { height: 100, width: 100, x: 0, y: 0 },
      { height: 100, width: 100, x: 150, y: 50 },
      { height: 80, width: 80, x: 300, y: 0 },
    ]);
    expect(parsedDocument.elements.map(({ id }) => id)).toStrictEqual([
      POSITIONED_RECTANGLE_ID,
      POSITIONED_FREE_ARROW_ID,
      stickyNoteId,
    ]);
  });

  test("a repeated element id is refused", () => {
    expect.hasAssertions();

    const { error } = positionedDocumentSchema.safeParse({
      elements: [POSITIONED_RECTANGLE, { ...POSITIONED_RECTANGLE, kind: ShapeKind.Process }],
    });

    expect(error?.issues.map(({ path }) => path)).toStrictEqual([["elements", 1, "id"]]);
  });
});
