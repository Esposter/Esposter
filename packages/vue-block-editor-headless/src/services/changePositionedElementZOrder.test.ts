import type { PositionedDocument } from "#src/models/PositionedDocument";

import { changePositionedElementZOrder } from "#src/services/changePositionedElementZOrder";
import { POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { applyPositionedEdit } from "#src/services/positionedEdit.test";
import { describe, expect, test } from "vitest";

describe(changePositionedElementZOrder, () => {
  test("moving an element in z-order reorders the element list", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW] };
    const operations = changePositionedElementZOrder(document, 0, 1);
    const reorderedDocument = applyPositionedEdit(document, operations);

    expect(reorderedDocument).toStrictEqual({ elements: [POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE] });
  });
});
