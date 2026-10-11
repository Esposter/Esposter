import { placeDroppedItems } from "#src/services/interaction/placeDroppedItems";
import { describe, expect, test } from "vitest";

describe(placeDroppedItems, () => {
  test("lays each item at the source's point, numbered from the page's count", () => {
    expect.hasAssertions();

    expect(
      placeDroppedItems(
        { id: "source", position: { x: 1, z: 2 } },
        [
          { count: 32, itemId: 202 },
          { count: 1, itemId: 112_005 },
        ],
        3,
      ),
    ).toStrictEqual([
      { count: 32, id: "source|3", itemId: 202, position: { x: 1, z: 2 } },
      { count: 1, id: "source|4", itemId: 112_005, position: { x: 1, z: 2 } },
    ]);
  });
});
