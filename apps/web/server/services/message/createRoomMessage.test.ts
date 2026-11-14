import type { RoomMessage } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";
import { describe } from "vitest";

// A message as its room's object holds it, with every field a suite does not read at its empty value
export const createRoomMessage = (overrides: Partial<RoomMessage>): RoomMessage => ({
  appUserId: null,
  appUserImage: "",
  createdAt: new Date(0),
  deletedAt: null,
  files: [],
  id: 1,
  isEdited: false,
  isForward: false,
  isPinned: false,
  linkPreviewResponse: null,
  mentions: [],
  message: "message",
  replyToId: null,
  senderName: null,
  type: MessageType.Message,
  updatedAt: new Date(0),
  userId: null,
  ...overrides,
});

describe.todo("createRoomMessage");
