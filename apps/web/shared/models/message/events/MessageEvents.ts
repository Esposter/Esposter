import type { Device } from "#shared/models/auth/Device";
import type {
  DeleteMessageInput,
  MessageEntity,
  StandardMessageEntity,
  Typing,
  UpdateMessageInput,
} from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

// Every event is a `[data, device?]` envelope, so the room subscriptions share one shape. An event no single
// Client caused carries no device, and reaches everyone in the room
export interface MessageEvents {
  createMessage: [[MessageEntity[], (Pick<Device, "sessionId"> & { isSendToSelf?: true })?]];
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
