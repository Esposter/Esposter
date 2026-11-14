import type { ClientMessage } from "@/models/message/ClientMessage";

import { MessageType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe } from "vitest";

// The message row every message test stores, reads and compares, so each suite states only what it varies
export const createMessage = (roomId: string, message = "", type = MessageType.Message): ClientMessage => ({
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
  message,
  replyToId: null,
  roomId,
  senderName: null,
  type,
  updatedAt: new Date(0),
  userId: v7(),
});

describe.todo("createMessage");
