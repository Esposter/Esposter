import type { RoomRoleInMessage } from "@esposter/db-schema";

import { describe } from "vitest";

export const createRoomRole = (overrides: Partial<RoomRoleInMessage>): RoomRoleInMessage => ({
  color: "",
  id: crypto.randomUUID(),
  isEveryone: false,
  name: "name",
  permissions: 0n,
  position: 0,
  roomId: crypto.randomUUID(),
  ...overrides,
});

describe.todo("createRoomRole");
