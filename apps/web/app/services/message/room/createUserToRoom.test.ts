import type { UserToRoomInMessage } from "@esposter/db-schema";

import { NotificationType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe } from "vitest";

export const createUserToRoom = (overrides: Partial<UserToRoomInMessage> = {}): UserToRoomInMessage => ({
  categoryId: null,
  createdAt: new Date(0),
  deletedAt: null,
  displayName: "",
  isHidden: false,
  lastMessageAt: null,
  lastReadAt: null,
  mentionCount: 0,
  notificationType: NotificationType.DirectMessage,
  roomId: v7(),
  timeoutUntil: null,
  updatedAt: new Date(0),
  userId: v7(),
  ...overrides,
});

describe.todo("createUserToRoom");
