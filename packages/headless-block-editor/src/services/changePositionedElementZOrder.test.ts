import type { PositionedDocument } from "#src/models/PositionedDocument";

import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { applyBlockEdit } from "#src/services/applyBlockEdit";
import { changePositionedElementZOrder } from "#src/services/changePositionedElementZOrder";
import { POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe(changePositionedElementZOrder, () => {
  test("moving an element in z-order reorders the element list", () => {
    expect.hasAssertions();

    const document: PositionedDocument = { elements: [POSITIONED_RECTANGLE, POSITIONED_FREE_ARROW] };
    const operations = changePositionedElementZOrder(document, 0, 1);
    const reorderedDocument = applyBlockEdit(positionedDocumentSchema, document, operations).match(
      ({ document: patchedDocument }) => patchedDocument,
      () => undefined,
    );

    expect(reorderedDocument).toStrictEqual({ elements: [POSITIONED_FREE_ARROW, POSITIONED_RECTANGLE] });
  });
});
