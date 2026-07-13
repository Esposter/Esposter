import type { RoomRoleInMessage } from "@esposter/db-schema";

import { randomUUID } from "node:crypto";
import { describe } from "vitest";

export const createRoomRole = (overrides: Partial<RoomRoleInMessage>): RoomRoleInMessage => ({
  color: "",
  createdAt: new Date(),
  deletedAt: null,
  id: randomUUID(),
  isEveryone: false,
  name: "name",
  permissions: 0n,
  position: 0,
  roomId: randomUUID(),
  updatedAt: new Date(),
  ...overrides,
});

describe.todo("createRoomRole");
