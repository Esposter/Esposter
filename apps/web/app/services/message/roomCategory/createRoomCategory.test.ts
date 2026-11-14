import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { v7 } from "uuid";
import { describe } from "vitest";

export const createRoomCategory = (overrides: Partial<RoomCategoryInMessage> = {}): RoomCategoryInMessage => ({
  createdAt: new Date(0),
  deletedAt: null,
  id: v7(),
  name: "name",
  position: 0,
  updatedAt: new Date(0),
  userId: v7(),
  ...overrides,
});

describe.todo("createRoomCategory");
