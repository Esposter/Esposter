import type { RoomInMessage } from "@esposter/db-schema";

import { MimeCategory, RoomType } from "@esposter/db-schema";
import { describe } from "vitest";

// The room row every room and direct message test stores, removes and rolls back — a direct message is a room
// Row too, so both suites build their fixtures from here
export const createRoom = (name: string, type = RoomType.Room): RoomInMessage => ({
  allowedMimeCategories: [MimeCategory.Image],
  categoryId: null,
  createdAt: new Date(0),
  deletedAt: null,
  id: crypto.randomUUID(),
  image: "",
  isInvitePaused: false,
  isReadOnly: false,
  maxFileSizeBytes: null,
  name,
  participantKey: type === RoomType.DirectMessage ? crypto.randomUUID() : null,
  slowmodeMs: null,
  topic: "",
  type,
  updatedAt: new Date(0),
  userId: crypto.randomUUID(),
});

describe.todo("createRoom");
