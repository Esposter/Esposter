import type { PositionedDocument } from "#src/models/PositionedDocument";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { bindPositionedArrowEnd } from "#src/services/bindPositionedArrowEnd";
import { CONNECTION_POINT_COUNT } from "#src/services/constants";
import {
  POSITIONED_ANNOTATION,
  POSITIONED_ANNOTATION_ID,
  POSITIONED_FREE_ARROW,
  POSITIONED_RECTANGLE,
} from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { describe, expect, test } from "vitest";

describe(bindPositionedArrowEnd, () => {
  const rectangleBinding = { connectionPointIndex: 2, elementId: POSITIONED_RECTANGLE.id };

  test("an arrow bound to a missing shape is refused", () => {
    expect.hasAssertions();

    const missingShapeId = crypto.randomUUID();
    const binding = { ...rectangleBinding, elementId: missingShapeId };
    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW] };
    const operations = bindPositionedArrowEnd(document, 1, ArrowEndKey.Start, binding);
    const boundArrow = { ...POSITIONED_FREE_ARROW, start: { ...POSITIONED_FREE_ARROW.start, binding } };
    const { error } = positionedDocumentSchema.safeParse({ elements: [POSITIONED_RECTANGLE, boundArrow] });

    expect(operations).toStrictEqual([]);
    expect(error?.issues.map(({ path }) => path)).toStrictEqual([["elements", 1, "start", "binding"]]);
  });

  test("an annotation refuses a binding", () => {
    expect.hasAssertions();

    const binding = { ...rectangleBinding, elementId: POSITIONED_ANNOTATION_ID };
    const document: PositionedDocument = { elements: [POSITIONED_ANNOTATION, POSITIONED_FREE_ARROW] };
    const operations = bindPositionedArrowEnd(document, 1, ArrowEndKey.End, binding);
    const boundArrow = { ...POSITIONED_FREE_ARROW, end: { ...POSITIONED_FREE_ARROW.end, binding } };
    const { error } = positionedDocumentSchema.safeParse({ elements: [POSITIONED_ANNOTATION, boundArrow] });

    expect(operations).toStrictEqual([]);
    expect(error?.issues.map(({ path }) => path)).toStrictEqual([["elements", 1, "end", "binding"]]);
  });

  test.each([-1, 1.5, CONNECTION_POINT_COUNT])(
    "a binding to connection point %s, which the shape does not have, is refused",
    (connectionPointIndex) => {
      expect.hasAssertions();

      const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW] };
      const operations = bindPositionedArrowEnd(document, 1, ArrowEndKey.Start, {
        ...rectangleBinding,
        connectionPointIndex,
      });

      expect(operations).toStrictEqual([]);
    },
  );

  test("binding a free arrow end moves the end onto the shape's connection point", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW] };
    const operations = bindPositionedArrowEnd(document, 1, ArrowEndKey.Start, rectangleBinding);
    const boundDocument = applyPositionedEdit(document, operations);

    expect(boundDocument).toStrictEqual({
      elements: [
        POSITIONED_RECTANGLE,
        { ...POSITIONED_FREE_ARROW, start: { binding: rectangleBinding, point: { x: 50, y: 100 } } },
      ],
    });
  });
});
