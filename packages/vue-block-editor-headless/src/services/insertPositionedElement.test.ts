import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StickyNoteElement } from "#src/models/StickyNoteElement";

import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { insertPositionedElement } from "#src/services/insertPositionedElement";
import { POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe(insertPositionedElement, () => {
  const STICKY_NOTE: StickyNoteElement = {
    fill: "#000000",
    height: 1,
    id: crypto.randomUUID(),
    text: "",
    type: PositionedElementType.StickyNote,
    width: 1,
    x: 0,
    y: 0,
  };

  test("inserting an element adds it at its index in the element list", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW] };
    const operations = insertPositionedElement(document, 1, STICKY_NOTE);
    const insertedDocument = applyBlockEdit(positionedDocumentSchema, document, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(insertedDocument).toStrictEqual({ elements: [POSITIONED_RECTANGLE, STICKY_NOTE, POSITIONED_FREE_ARROW] });
  });

  test("inserting an arrow bound to a missing shape returns no operations", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE] };
    const operations = insertPositionedElement(document, 1, {
      ...POSITIONED_FREE_ARROW,
      end: { ...POSITIONED_FREE_ARROW.end, binding: { connectionPointIndex: 0, elementId: crypto.randomUUID() } },
    });

    expect(operations).toStrictEqual([]);
  });
});
