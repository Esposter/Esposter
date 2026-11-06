import type { PositionedDocument } from "#src/models/PositionedDocument";

import { ArrowEndKey } from "#src/models/ArrowEndKey";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { unbindPositionedArrowEnd } from "#src/services/unbindPositionedArrowEnd";
import { describe, expect, test } from "vitest";

describe(unbindPositionedArrowEnd, () => {
  test("unbinding an arrow end keeps its point where it is", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_ARROW] };
    const operations = unbindPositionedArrowEnd(document, 1, ArrowEndKey.Start);
    const unboundDocument = applyPositionedEdit(document, operations);

    expect(unboundDocument).toStrictEqual({
      elements: [
        POSITIONED_RECTANGLE,
        { ...POSITIONED_ARROW, start: { hasArrowhead: false, point: { x: 50, y: 100 } } },
      ],
    });
  });
});
