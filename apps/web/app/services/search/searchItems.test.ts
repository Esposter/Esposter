import { searchItems } from "@/services/search/searchItems";
import { describe, expect, test } from "vitest";

describe(searchItems, () => {
  const getFields = ({ description, title }: { description: string; title: string }) => ({ description, title });
  const firstItem = { description: "c", title: "ab" };
  const secondItem = { description: "ab", title: "d" };

  test("returns every item for an empty query", () => {
    expect.hasAssertions();

    expect(searchItems([firstItem, secondItem], "", getFields)).toStrictEqual([firstItem, secondItem]);
  });

  test("matches a prefix in any field, ignoring case", () => {
    expect.hasAssertions();

    expect(searchItems([firstItem, secondItem], "A", getFields, { title: 2 })).toStrictEqual([firstItem, secondItem]);
  });

  // Every term is required, so a second word narrows rather than widens
  test("requires every term", () => {
    expect.hasAssertions();

    expect(searchItems([firstItem, secondItem], "ab c", getFields)).toStrictEqual([firstItem]);
  });

  test("returns no items when nothing matches", () => {
    expect.hasAssertions();

    expect(searchItems([firstItem], "e", getFields)).toStrictEqual([]);
  });
});
