import type { Device } from "#shared/models/auth/Device";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { StandardMessageEntity } from "@esposter/db-schema";
import type { SetOptional } from "type-fest";

export interface MessageEvents {
  createMessage: [[StandardMessageEntity[], Pick<Device, "sessionId"> & { isSendToSelf?: true }]];
  // Typing events also propagate to the account's other devices for better UX.
  createTyping: [CreateTypingInput & Pick<Device, "sessionId">];
  deleteMessage: [DeleteMessageInput];
  // UpdatedAt is implicitly updated too, but we never read it (all properties are set via Object.assign),
  // So we don't declare it in the type.
  updateMessage: [
    SetOptional<
      Pick<StandardMessageEntity, "files" | "isEdited" | "isPinned" | "linkPreviewResponse"> & UpdateMessageInput,
      "files" | "linkPreviewResponse" | "message"
    >,
  ];
}
