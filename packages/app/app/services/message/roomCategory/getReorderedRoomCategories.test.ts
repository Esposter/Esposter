import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { getReorderedRoomCategories } from "@/services/message/roomCategory/getReorderedRoomCategories";
import { describe, expect, test } from "vitest";

describe(getReorderedRoomCategories, () => {
  const firstCategory = createRoomCategory();
  const secondCategory = createRoomCategory();
  const thirdCategory = createRoomCategory();
  const categories = [firstCategory, secondCategory, thirdCategory];

  test("moves a category towards the start", () => {
    expect.hasAssertions();

    const reorderedCategories = getReorderedRoomCategories(categories, secondCategory.id, -1);

    expect(reorderedCategories).toStrictEqual([secondCategory, firstCategory, thirdCategory]);
  });

  test("moves a category towards the end", () => {
    expect.hasAssertions();

    const reorderedCategories = getReorderedRoomCategories(categories, secondCategory.id, 1);

    expect(reorderedCategories).toStrictEqual([firstCategory, thirdCategory, secondCategory]);
  });

  test("leaves the input untouched", () => {
    expect.hasAssertions();

    getReorderedRoomCategories(categories, secondCategory.id, 1);

    expect(categories).toStrictEqual([firstCategory, secondCategory, thirdCategory]);
  });

  test.each([
    [-1, "first"],
    [1, "last"],
  ] as const)("is undefined when moving the %s category past the edge", (direction, position) => {
    expect.hasAssertions();

    const category = position === "first" ? firstCategory : thirdCategory;

    expect(getReorderedRoomCategories(categories, category.id, direction)).toBeUndefined();
  });

  // A findIndex miss reads as -1, which splice takes as the last index — so falling through moves the last
  // Category instead of refusing
  test("is undefined when the category is not in the list", () => {
    expect.hasAssertions();

    expect(getReorderedRoomCategories(categories, "-1", 1)).toBeUndefined();
  });
});
