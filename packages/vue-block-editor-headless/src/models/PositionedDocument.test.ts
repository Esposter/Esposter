import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";

import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { ShapeKind } from "#src/models/ShapeKind";
import { POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe("positionedDocumentSchema", () => {
  test("a document of typed elements parses back unchanged", () => {
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
  });

  test("a repeated element id is refused", () => {
    expect.hasAssertions();

    const { error } = positionedDocumentSchema.safeParse({
      elements: [POSITIONED_RECTANGLE, { ...POSITIONED_RECTANGLE, kind: ShapeKind.Process }],
    });

    expect(error?.issues.map(({ path }) => path)).toStrictEqual([["elements", 1, "id"]]);
  });
});
