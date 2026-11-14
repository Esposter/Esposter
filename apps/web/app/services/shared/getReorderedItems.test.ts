import { getReorderedItems } from "@/services/shared/getReorderedItems";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getReorderedItems, () => {
  const firstItem = { id: v7() };
  const hiddenItem = { id: v7() };
  const lastItem = { id: v7() };

  // A search hides a row between the two that swap, and the hidden row keeps its place between them
  test("keeps a row the order leaves out in its own place", () => {
    expect.hasAssertions();

    expect(getReorderedItems([firstItem, hiddenItem, lastItem], [lastItem.id, firstItem.id])).toStrictEqual([
      lastItem,
      hiddenItem,
      firstItem,
    ]);
  });

  test("passes over an id no longer in the list", () => {
    expect.hasAssertions();

    expect(getReorderedItems([firstItem, lastItem], [lastItem.id, hiddenItem.id, firstItem.id])).toStrictEqual([
      lastItem,
      firstItem,
    ]);
  });
});
