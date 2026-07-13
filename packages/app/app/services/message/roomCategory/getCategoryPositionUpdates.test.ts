import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { getCategoryPositionUpdates } from "@/services/message/roomCategory/getCategoryPositionUpdates";
import { randomUUID } from "node:crypto";
import { describe, expect, test } from "vitest";

const createRoomCategory = (overrides: Partial<RoomCategoryInMessage>): RoomCategoryInMessage => ({
  createdAt: new Date(),
  deletedAt: null,
  id: randomUUID(),
  name: "name",
  position: 0,
  updatedAt: new Date(),
  userId: randomUUID(),
  ...overrides,
});

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
