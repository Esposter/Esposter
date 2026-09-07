import type { RoomRoleInMessage } from "@esposter/db-schema";

import { describe } from "vitest";

export const createRoomRole = (overrides: Partial<RoomRoleInMessage>): RoomRoleInMessage => ({
  color: "",
  createdAt: new Date(),
  deletedAt: null,
  id: crypto.randomUUID(),
  isEveryone: false,
  name: "name",
  permissions: 0n,
  position: 0,
  roomId: crypto.randomUUID(),
  updatedAt: new Date(),
  ...overrides,
});

describe.todo("createRoomRole");
