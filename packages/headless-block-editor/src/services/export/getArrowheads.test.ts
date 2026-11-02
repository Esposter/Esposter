import { getArrowheads } from "#src/services/export/getArrowheads";
import { POSITIONED_ARROW } from "#src/services/positionedConstants.test";
import { describe, expect, test } from "vitest";

describe(getArrowheads, () => {
  test("an arrow with an arrowhead only at its end gets one arrowhead, with its tip at the end", () => {
    expect.hasAssertions();

    // The arrow's start has no arrowhead and its end has one, so the only head is the one at the end of the route
    expect(
      getArrowheads(POSITIONED_ARROW, [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    ).toStrictEqual([
      [
        { x: 100, y: 0 },
        { x: 88, y: 5 },
        { x: 88, y: -5 },
      ],
    ]);
  });

  test("a route of one point has no arrowheads to point along", () => {
    expect.hasAssertions();

    expect(getArrowheads(POSITIONED_ARROW, [{ x: 0, y: 0 }])).toStrictEqual([]);
  });
});
