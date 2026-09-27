import { getMovedItems } from "@/services/shared/getMovedItems";
import { describe, expect, test } from "vitest";

describe(getMovedItems, () => {
  const items = ["a", "b", "c"];

  test.each([
    [-1, ["b", "a", "c"]],
    [1, ["a", "c", "b"]],
  ] as const)("moves an item one place by %i, leaving the input untouched", (direction, movedItems) => {
    expect.hasAssertions();

    expect(getMovedItems(items, 1, direction)).toStrictEqual(movedItems);
    expect(items).toStrictEqual(["a", "b", "c"]);
  });

  test.each([
    [0, -1],
    [2, 1],
  ] as const)("is undefined moving the item at %i past the edge", (index, direction) => {
    expect.hasAssertions();

    expect(getMovedItems(items, index, direction)).toBeUndefined();
  });

  // A findIndex miss reads as -1, which splice takes as the last index — so falling through moves the last item
  // Instead of refusing
  test("is undefined for a lookup that missed", () => {
    expect.hasAssertions();

    expect(getMovedItems(items, -1, 1)).toBeUndefined();
  });
});
