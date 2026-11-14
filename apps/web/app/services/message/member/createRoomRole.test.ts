import type { RoomRoleInMessage } from "@esposter/db-schema";

import { v7 } from "uuid";
import { describe } from "vitest";

export const createRoomRole = (overrides: Partial<RoomRoleInMessage>): RoomRoleInMessage => ({
  color: "",
  createdAt: new Date(0),
  deletedAt: null,
  id: v7(),
  isEveryone: false,
  name: "name",
  permissions: 0n,
  position: 0,
  roomId: v7(),
  updatedAt: new Date(0),
  ...overrides,
});

describe.todo("createRoomRole");
