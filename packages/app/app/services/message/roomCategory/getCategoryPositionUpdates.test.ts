import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { getCategoryPositionUpdates } from "@/services/message/roomCategory/getCategoryPositionUpdates";
import { describe, expect, test } from "vitest";

describe(getCategoryPositionUpdates, () => {
  const firstCategory = createRoomCategory({ position: 0 });
  const secondCategory = createRoomCategory({ position: 1 });

  test("returns updates only for categories whose position differs from their index", () => {
    expect.hasAssertions();

    expect(getCategoryPositionUpdates([secondCategory, firstCategory])).toStrictEqual([
      { id: secondCategory.id, position: 0 },
      { id: firstCategory.id, position: 1 },
    ]);
  });

  test("returns no updates when the order is unchanged", () => {
    expect.hasAssertions();

    expect(getCategoryPositionUpdates([firstCategory, secondCategory])).toStrictEqual([]);
  });
});
