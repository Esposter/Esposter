import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { getReorderedRoomCategories } from "@/services/message/roomCategory/getReorderedRoomCategories";
import { describe, expect, test } from "vitest";

describe(getReorderedRoomCategories, () => {
  const userId = crypto.randomUUID();
  const createRoomCategory = (): RoomCategoryInMessage => ({
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    id: crypto.randomUUID(),
    name: "name",
    position: 0,
    updatedAt: new Date("1970-01-01"),
    userId,
  });
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

  // A findIndex miss used to fall through to splice(-1, 1), silently moving the last category instead
  test("is undefined when the category is not in the list", () => {
    expect.hasAssertions();

    expect(getReorderedRoomCategories(categories, "-1", 1)).toBeUndefined();
  });
});
