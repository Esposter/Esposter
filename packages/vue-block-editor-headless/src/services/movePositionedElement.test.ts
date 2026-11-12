import type { ArrowElement } from "#src/models/ArrowElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";
import type { StrokeElement } from "#src/models/StrokeElement";
import type { JsonPatchOperation } from "@esposter/shared";

import { ArrowheadKind } from "#src/models/ArrowheadKind";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { StrokeWidth } from "#src/models/StrokeWidth";
import { movePositionedElement } from "#src/services/movePositionedElement";
import {
  POSITIONED_ARROW,
  POSITIONED_PROCESS,
  POSITIONED_PROCESS_ID,
  POSITIONED_RECTANGLE,
} from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { applyPatches, createHistory, pushHistory, undoHistory } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(movePositionedElement, () => {
  const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
  const stroke: StrokeElement = {
    color: "",
    id: crypto.randomUUID(),
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 30 },
    ],
    strokeWidth: StrokeWidth.Medium,
    type: PositionedElementType.Stroke,
  };

  test("moving a stroke moves every point of it", () => {
    expect.hasAssertions();

    const strokeDocument: PositionedDocument = { elements: [stroke] };
    const operations = movePositionedElement(strokeDocument, 0, { x: 110, y: 60 });
    const movedDocument = applyPositionedEdit(strokeDocument, operations);

    expect(movedDocument).toStrictEqual({
      elements: [
        {
          ...stroke,
          points: [
            { x: 110, y: 60 },
            { x: 120, y: 60 },
            { x: 120, y: 80 },
          ],
        },
      ],
    });
  });

  test("moving an arrow moves its free end and leaves its bound end", () => {
    expect.hasAssertions();

    const operations = movePositionedElement(document, 1, { x: 60, y: 120 });
    const movedDocument = applyPositionedEdit(document, operations);

    expect(movedDocument).toStrictEqual({
      elements: [
        POSITIONED_RECTANGLE,
        { ...POSITIONED_ARROW, end: { ...POSITIONED_ARROW.end, point: { x: 160, y: 270 } } },
      ],
    });
  });

  test("an arrow bound at both ends does not move", () => {
    expect.hasAssertions();

    const boundArrow: ArrowElement = {
      ...POSITIONED_ARROW,
      end: {
        binding: { connectionPointIndex: 0, elementId: POSITIONED_PROCESS_ID },
        arrowhead: ArrowheadKind.Triangle,
        point: { x: 250, y: 0 },
      },
    };
    const boundDocument: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_PROCESS, boundArrow] };

    expect(movePositionedElement(boundDocument, 2, { x: 0, y: 0 })).toStrictEqual([]);
  });

  test("moving a shape reroutes its bound arrows in the same edit", () => {
    expect.hasAssertions();

    const operations = movePositionedElement(document, 0, { x: 200, y: 0 });
    const movedDocument = applyPositionedEdit(document, operations);

    expect(movedDocument).toStrictEqual({
      elements: [
        { ...POSITIONED_RECTANGLE, x: 200 },
        { ...POSITIONED_ARROW, start: { ...POSITIONED_ARROW.start, point: { x: 250, y: 100 } } },
      ],
    });
  });

  test("an undo reverts a move and its reroute together", () => {
    expect.hasAssertions();

    const operations: JsonPatchOperation[] = movePositionedElement(document, 0, { x: 200, y: 0 });
    const { document: movedDocument, inverses } = applyPatches(document, operations);
    const recordedHistory = pushHistory(createHistory<JsonPatchOperation[]>(1), inverses);
    const { entry } = undoHistory(recordedHistory);

    assert.exists(entry);
    expect(applyPatches(movedDocument, entry).document).toStrictEqual(document);
  });
});
