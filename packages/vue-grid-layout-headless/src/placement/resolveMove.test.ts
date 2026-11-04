import { CollisionMode } from "#src/models/CollisionMode";
import { resolveMove } from "#src/placement/resolveMove";
import { describe, expect, test } from "vitest";

describe(resolveMove, () => {
  test("a swap trades places when the moved item lands on the other by one column", () => {
    expect.hasAssertions();

    expect(
      resolveMove(
        [
          { h: 2, id: "a", w: 2, x: 0, y: 0 },
          { h: 2, id: "b", w: 2, x: 2, y: 0 },
        ],
        { h: 2, id: "a", w: 2, x: 1, y: 0 },
        CollisionMode.Swap,
      ),
    ).toStrictEqual([
      { h: 2, id: "a", w: 2, x: 2, y: 0 },
      { h: 2, id: "b", w: 2, x: 0, y: 0 },
    ]);
  });

  test("a resize under swap pushes the item it lands on rather than trading places with it", () => {
    expect.hasAssertions();

    expect(
      resolveMove(
        [
          { h: 2, id: "a", w: 2, x: 0, y: 0 },
          { h: 2, id: "b", w: 2, x: 2, y: 0 },
        ],
        { h: 2, id: "a", w: 3, x: 0, y: 0 },
        CollisionMode.Swap,
      ),
    ).toStrictEqual([
      { h: 2, id: "a", w: 3, x: 0, y: 0 },
      { h: 2, id: "b", w: 2, x: 2, y: 2 },
    ]);
  });
});
