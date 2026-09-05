import type { Device } from "#shared/models/auth/Device";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { StandardMessageEntity } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";
// Every event is a `[data, device?]` envelope, so the room subscriptions share one shape. An event no single
// Client caused carries no device, and reaches everyone in the room
export interface MessageEvents {
  createMessage: [[StandardMessageEntity[], Pick<Device, "sessionId"> & { isSendToSelf?: true }]];
  // Typing propagates to the account's other devices too, unlike every other event
  createTyping: [[CreateTypingInput, Device]];
  deleteMessage: [[DeleteMessageInput]];
  // UpdatedAt moves with the write and nothing reads it back, so it is left out of the payload
  updateMessage: [
    [
      SetOptional<
        Pick<StandardMessageEntity, "files" | "isEdited" | "isPinned" | "linkPreviewResponse"> & UpdateMessageInput,
        "files" | "linkPreviewResponse" | "message"
      >,
    ],
  ];
}
