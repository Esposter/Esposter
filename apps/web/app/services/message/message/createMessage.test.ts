import type { MessageInMessage } from "@esposter/db-schema";

import { MessageType } from "@esposter/db-schema";
import { describe } from "vitest";

// The message row every message test stores, reads and compares, so each suite states only what it varies
export const createMessage = (roomId: string, message = "", type = MessageType.Message): MessageInMessage => ({
  appUserId: null,
  appUserImage: "",
  createdAt: new Date(0),
  deletedAt: null,
  filenames: "",
  files: [],
  id: crypto.randomUUID(),
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
  userId: crypto.randomUUID(),
});

describe.todo("createMessage");
