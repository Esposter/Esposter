import { getFirstFreeCell } from "#src/placement/getFirstFreeCell";
import { describe, expect, test } from "vitest";

describe(getFirstFreeCell, () => {
  test("a new item next to existing items", () => {
    expect.hasAssertions();

    expect(
      getFirstFreeCell(
        [
          { h: 1, id: "a", w: 1, x: 0, y: 0 },
          { h: 1, id: "b", w: 1, x: 1, y: 0 },
        ],
        4,
        { h: 1, w: 2 },
      ),
    ).toStrictEqual({ h: 1, w: 2, x: 2, y: 0 });
  });
});
