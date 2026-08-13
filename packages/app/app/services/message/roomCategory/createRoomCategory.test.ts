import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { describe } from "vitest";

export const createRoomCategory = (overrides: Partial<RoomCategoryInMessage> = {}): RoomCategoryInMessage => ({
  createdAt: new Date(0),
  deletedAt: null,
  id: crypto.randomUUID(),
  name: "name",
  position: 0,
  updatedAt: new Date(0),
  userId: crypto.randomUUID(),
  ...overrides,
});

describe.todo("createRoomCategory");
