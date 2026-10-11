import { getMovedItems } from "@/services/shared/getMovedItems";
import { describe, expect, test } from "vitest";

describe(getMovedItems, () => {
  const items = ["a", "b", "c"];

  test.each([
    [0, ["b", "a", "c"]],
    [2, ["a", "c", "b"]],
  ] as const)("moves an item to %i, leaving the input untouched", (toIndex, movedItems) => {
    expect.hasAssertions();

    expect(getMovedItems(items, 1, toIndex)).toStrictEqual(movedItems);
    expect(items).toStrictEqual(["a", "b", "c"]);
  });

  test("moves an item across several places", () => {
    expect.hasAssertions();

    expect(getMovedItems(items, 2, 0)).toStrictEqual(["c", "a", "b"]);
  });

  test.each([
    [0, -1],
    [2, 3],
    [1, 1],
  ] as const)("is undefined moving the item at %i to %i", (index, toIndex) => {
    expect.hasAssertions();

    expect(getMovedItems(items, index, toIndex)).toBeUndefined();
  });

  // A findIndex miss reads as -1, which splice takes as the last index — so falling through moves the last item
  // Instead of refusing
  test("is undefined for a lookup that missed", () => {
    expect.hasAssertions();

    expect(getMovedItems(items, -1, 0)).toBeUndefined();
  });
});
