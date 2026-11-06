import type { PositionedDocument } from "#src/models/PositionedDocument";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { updatePositionedElementProperty } from "#src/services/updatePositionedElementProperty";
import { describe, expect, test } from "vitest";

describe(updatePositionedElementProperty, () => {
  const POSITIONED_DOCUMENT: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };

  test("setting a shape's fill replaces it and leaves the shape in place", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 0, { property: "fill", value: "#fde68a" });
    const editedDocument = applyBlockEdit(positionedDocumentSchema, POSITIONED_DOCUMENT, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(editedDocument?.elements).toStrictEqual([{ ...POSITIONED_RECTANGLE, fill: "#fde68a" }, POSITIONED_ARROW]);
  });

  test("setting an arrow's route replaces its path kind", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      property: "pathKind",
      value: ArrowPathKind.Curved,
    });
    const editedDocument = applyBlockEdit(positionedDocumentSchema, POSITIONED_DOCUMENT, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(editedDocument?.elements[1]).toStrictEqual({ ...POSITIONED_ARROW, pathKind: ArrowPathKind.Curved });
  });

  test("setting an arrowhead replaces the flag at its end only", () => {
    expect.hasAssertions();

    const operations = updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, {
      end: ArrowEndKey.End,
      property: "hasArrowhead",
      value: false,
    });
    const editedDocument = applyBlockEdit(positionedDocumentSchema, POSITIONED_DOCUMENT, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(editedDocument?.elements[1]).toStrictEqual({
      ...POSITIONED_ARROW,
      end: { ...POSITIONED_ARROW.end, hasArrowhead: false },
    });
  });

  test("a property the element does not hold leaves the document unchanged", () => {
    expect.hasAssertions();

    expect(
      updatePositionedElementProperty(POSITIONED_DOCUMENT, 1, { property: "fill", value: "#fde68a" }),
    ).toStrictEqual([]);
  });
});
