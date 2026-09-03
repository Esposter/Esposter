import { RoomPermissionCategoryItems } from "@/services/message/room/role/RoomPermissionCategoryItems";
import { describe, expect, test } from "vitest";

describe("roomPermissionCategoryItems", () => {
  // The headings are read off the bit order rather than declared, so a permission whose category does not match
  // The bits either side of it draws that heading twice — a defect nothing else can see, since both lists are
  // Correct on their own
  test("gives each category exactly one heading", () => {
    expect.hasAssertions();

    const categories = RoomPermissionCategoryItems.map(({ category }) => category);

    expect(categories).toStrictEqual([...new Set(categories)]);
  });
});
