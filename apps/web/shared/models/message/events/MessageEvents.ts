import type { Device } from "#shared/models/auth/Device";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { Typing } from "#shared/models/message/Typing";
import type { StandardMessageEntity } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

// Every event is a `[data, device?]` envelope, so the room subscriptions share one shape. An event no single
// Client caused carries no device, and reaches everyone in the room
export interface MessageEvents {
  createMessage: [[StandardMessageEntity[], Pick<Device, "sessionId"> & { isSendToSelf?: true }]];
  // Typing propagates to the account's other devices too, unlike every other event
  createTyping: [[Typing, Device]];
  deleteMessage: [[DeleteMessageInput]];
  // `updatedAt` moves with the write and nothing reads it back, so it is left out of the payload
  updateMessage: [
    [
      SetOptional<
        Pick<StandardMessageEntity, "files" | "isEdited" | "isPinned" | "linkPreviewResponse"> & UpdateMessageInput,
        "files" | "linkPreviewResponse" | "message"
      >,
    ],
  ];
}
