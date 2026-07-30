import { getCachedItems } from "@/services/cache/indexedDb/getCachedItems";
import { describe, expect, test } from "vitest";

describe(getCachedItems, () => {
  const items = ["a", "b", "c"];

  test("keeps the head of the list up to the limit", () => {
    expect.hasAssertions();

    expect(getCachedItems(items, 2)).toStrictEqual(["a", "b"]);
  });

  // A store that configures no limit caches whatever it is given
  test("keeps every item when there is no limit", () => {
    expect.hasAssertions();

    expect(getCachedItems(items)).toStrictEqual(items);
  });

  // Truthiness reads a zero limit as no limit, which persists the whole list for a store that asked for none
  test("keeps nothing for a limit of zero", () => {
    expect.hasAssertions();

    expect(getCachedItems(items, 0)).toStrictEqual([]);
  });
});
