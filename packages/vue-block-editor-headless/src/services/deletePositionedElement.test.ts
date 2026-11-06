import type { ArrowElement } from "#src/models/ArrowElement";
import type { PositionedDocument } from "#src/models/PositionedDocument";

import { ArrowPathKind } from "#src/models/ArrowPathKind";
import { PositionedElementType } from "#src/models/PositionedElementType";
import { deletePositionedElement } from "#src/services/deletePositionedElement";
import {
  POSITIONED_ARROW,
  POSITIONED_PROCESS,
  POSITIONED_PROCESS_ID,
  POSITIONED_RECTANGLE,
} from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { describe, expect, test } from "vitest";

describe(deletePositionedElement, () => {
  test("deleting a shape removes arrows bound only to it", () => {
    expect.hasAssertions();

    // Bound to the rectangle at its start and to the process at its end, so it survives with its start unbound
    const arrowToProcess: ArrowElement = {
      end: {
        binding: { connectionPointIndex: 3, elementId: POSITIONED_PROCESS_ID },
        hasArrowhead: true,
        point: { x: 200, y: 50 },
      },
      id: crypto.randomUUID(),
      label: "",
      pathKind: ArrowPathKind.Straight,
      start: POSITIONED_ARROW.start,
      type: PositionedElementType.Arrow,
    };
    const document: PositionedDocument = {
      elements: [POSITIONED_RECTANGLE, POSITIONED_PROCESS, arrowToProcess, POSITIONED_ARROW],
    };
    const operations = deletePositionedElement(document, 0);
    const remainingDocument = applyPositionedEdit(document, operations);

    expect(remainingDocument).toStrictEqual({
      elements: [POSITIONED_PROCESS, { ...arrowToProcess, start: { hasArrowhead: false, point: { x: 50, y: 100 } } }],
    });
  });
});
