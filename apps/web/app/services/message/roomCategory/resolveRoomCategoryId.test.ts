import { createRoomCategory } from "@/services/message/roomCategory/createRoomCategory.test";
import { resolveRoomCategoryId } from "@/services/message/roomCategory/resolveRoomCategoryId";
import { describe, expect, test } from "vitest";

describe(resolveRoomCategoryId, () => {
  const roomCategory = createRoomCategory();

  test("returns the room's category when the reader still has it", () => {
    expect.hasAssertions();

    expect(resolveRoomCategoryId([roomCategory], roomCategory.id)).toStrictEqual(roomCategory.id);
  });

  // A category deleted elsewhere is gone from the reader's list, and the room must stay listed as uncategorized rather
  // Than drop out of the sidebar
  test.each([
    ["no membership", undefined],
    ["no category", null],
    ["a category the reader no longer has", "-1"],
  ])("returns null for %s", (_description, categoryId) => {
    expect.hasAssertions();

    expect(resolveRoomCategoryId([roomCategory], categoryId)).toBeNull();
  });
});
