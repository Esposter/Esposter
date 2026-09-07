import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { getRoomCategoryPositionUpdates } from "@/services/message/roomCategory/getRoomCategoryPositionUpdates";
import { describe, expect, test } from "vitest";

describe(getRoomCategoryPositionUpdates, () => {
  const firstRoomCategory = createRoomCategory({ position: 0 });
  const secondRoomCategory = createRoomCategory({ position: 1 });

  test("returns updates only for roomCategories whose position differs from their index", () => {
    expect.hasAssertions();

    expect(getRoomCategoryPositionUpdates([secondRoomCategory, firstRoomCategory])).toStrictEqual([
      { id: secondRoomCategory.id, position: 0 },
      { id: firstRoomCategory.id, position: 1 },
    ]);
  });

  test("returns no updates when the order is unchanged", () => {
    expect.hasAssertions();

    expect(getRoomCategoryPositionUpdates([firstRoomCategory, secondRoomCategory])).toStrictEqual([]);
  });
});
