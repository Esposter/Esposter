import { getRestoredItems } from "@/services/shared/getRestoredItems";
import { describe, expect, test } from "vitest";

describe(getRestoredItems, () => {
  const firstItem = { id: crypto.randomUUID() };
  const restoredItem = { id: crypto.randomUUID() };
  const lastItem = { id: crypto.randomUUID() };

  test("restores the row where it stood", () => {
    expect.hasAssertions();

    expect(getRestoredItems([firstItem, lastItem], restoredItem, 1)).toStrictEqual([firstItem, restoredItem, lastItem]);
  });

  test("restores the row at the end of a list that shrank past its place", () => {
    expect.hasAssertions();

    expect(getRestoredItems([firstItem], restoredItem, 2)).toStrictEqual([firstItem, restoredItem]);
  });

  // A re-read that landed while the delete was in flight already holds the row the server never removed
  test("leaves a row that is already back alone", () => {
    expect.hasAssertions();

    expect(getRestoredItems([firstItem, restoredItem], restoredItem, 0)).toStrictEqual([firstItem, restoredItem]);
  });
});
