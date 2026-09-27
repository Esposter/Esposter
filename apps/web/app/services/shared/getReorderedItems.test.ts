import { getReorderedItems } from "@/services/shared/getReorderedItems";
import { describe, expect, test } from "vitest";

describe(getReorderedItems, () => {
  const firstItem = { id: crypto.randomUUID() };
  const hiddenItem = { id: crypto.randomUUID() };
  const lastItem = { id: crypto.randomUUID() };

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
