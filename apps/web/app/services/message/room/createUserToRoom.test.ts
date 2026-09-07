import type { UserToRoomInMessage } from "@esposter/db-schema";

import { NotificationType } from "@esposter/db-schema";
import { describe } from "vitest";

export const createUserToRoom = (overrides: Partial<UserToRoomInMessage> = {}): UserToRoomInMessage => ({
  createdAt: new Date(0),
  deletedAt: null,
  isHidden: false,
  lastMessageAt: null,
  mentionCount: 0,
  nickname: "",
  notificationType: NotificationType.DirectMessage,
  roomId: crypto.randomUUID(),
  timeoutUntil: null,
  updatedAt: new Date(0),
  userId: crypto.randomUUID(),
  ...overrides,
});

describe.todo("createUserToRoom");
