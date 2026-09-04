import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { getReorderedRoomCategories } from "@/services/message/roomCategory/getReorderedRoomCategories";
import { describe, expect, test } from "vitest";

describe(getReorderedRoomCategories, () => {
  const firstRoomCategory = createRoomCategory();
  const secondRoomCategory = createRoomCategory();
  const thirdRoomCategory = createRoomCategory();
  const roomCategories = [firstRoomCategory, secondRoomCategory, thirdRoomCategory];

  test("moves a roomCategory towards the start", () => {
    expect.hasAssertions();

    const reorderedRoomCategories = getReorderedRoomCategories(roomCategories, secondRoomCategory.id, -1);

    expect(reorderedRoomCategories).toStrictEqual([secondRoomCategory, firstRoomCategory, thirdRoomCategory]);
  });

  test("moves a roomCategory towards the end", () => {
    expect.hasAssertions();

    const reorderedRoomCategories = getReorderedRoomCategories(roomCategories, secondRoomCategory.id, 1);

    expect(reorderedRoomCategories).toStrictEqual([firstRoomCategory, thirdRoomCategory, secondRoomCategory]);
  });

  test("leaves the input untouched", () => {
    expect.hasAssertions();

    getReorderedRoomCategories(roomCategories, secondRoomCategory.id, 1);

    expect(roomCategories).toStrictEqual([firstRoomCategory, secondRoomCategory, thirdRoomCategory]);
  });

  test.each([
    [-1, "first"],
    [1, "last"],
  ] as const)("is undefined when moving the %s roomCategory past the edge", (direction, position) => {
    expect.hasAssertions();

    const roomCategory = position === "first" ? firstRoomCategory : thirdRoomCategory;

    expect(getReorderedRoomCategories(roomCategories, roomCategory.id, direction)).toBeUndefined();
  });

  // A findIndex miss reads as -1, which splice takes as the last index — so falling through moves the last
  // Category instead of refusing
  test("is undefined when the roomCategory is not in the list", () => {
    expect.hasAssertions();

    expect(getReorderedRoomCategories(roomCategories, "-1", 1)).toBeUndefined();
  });
});
