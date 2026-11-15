import type { RoomMessage } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";
import { describe } from "vitest";

// A message as its room's object returns it: the fields a test reads are given, and the rest hold their least value
export const createRoomMessage = (fields: Partial<RoomMessage> & Pick<RoomMessage, "id">): RoomMessage => ({
  appUserId: null,
  appUserImage: "",
  createdAt: new Date(0),
  deletedAt: null,
  editedAt: null,
  files: [],
  isForward: false,
  isPinned: false,
  linkPreviewResponse: null,
  mentions: [],
  message: "",
  replyToId: null,
  senderName: null,
  type: MessageType.Message,
  updatedAt: new Date(0),
  userId: null,
  ...fields,
});

describe.todo("createRoomMessage");
