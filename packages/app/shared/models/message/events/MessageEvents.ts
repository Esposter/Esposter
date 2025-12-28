import type { Device } from "#shared/models/auth/Device";
import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { StandardMessageEntity } from "@esposter/db-schema";
import type { PartialByKeys } from "@esposter/shared";

export interface MessageEvents {
  createMessage: [StandardMessageEntity[], Pick<Device, "sessionId"> & { isSendToSelf?: true }][];
  // We'll allow typing events to also be propagated to separate devices of the same account
  // Why? Because we can. (also it's better UX I suppose)
  createTyping: (CreateTypingInput & Pick<Device, "sessionId">)[];
  deleteMessage: DeleteMessageInput[];
  // UpdatedAt also gets implicitly updated, but for the sake of my sanity in not wanting to do any more type-massaging
  // And the fact that we never explicitly use updatedAt anyways (we always update all the properties via Object.assign),
  // We don't need to strictly declare the type c:
  updateMessage: PartialByKeys<
    Pick<StandardMessageEntity, "files" | "isEdited" | "isPinned" | "linkPreviewResponse"> & UpdateMessageInput,
    "files" | "linkPreviewResponse" | "message"
  >[];
}
