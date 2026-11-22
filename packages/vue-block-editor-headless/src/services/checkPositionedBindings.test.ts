import { positionedDocumentSchema } from "#src/models/PositionedDocument";
import { checkPositionedBindings } from "#src/services/checkPositionedBindings";
import { POSITIONED_ARROW, POSITIONED_RECTANGLE } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe(checkPositionedBindings, () => {
  test("a bound end whose point is off the connection point its binding names is refused", () => {
    expect.hasAssertions();

    const offPointArrow = { ...POSITIONED_ARROW, start: { ...POSITIONED_ARROW.start, point: { x: 51, y: 100 } } };
    const { error } = positionedDocumentSchema.safeParse({ elements: [POSITIONED_RECTANGLE, offPointArrow] });

    expect(error?.issues.map(({ path }) => path)).toStrictEqual([["elements", 1, "start", "point"]]);
  });
});
