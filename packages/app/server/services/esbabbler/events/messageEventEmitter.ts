import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";

import { EventEmitter } from "node:events";

interface MessageEvents {
  createMessage: [MessageEntity[], isIncludesSelf?: true][];
  createTyping: CreateTypingInput[];
  deleteMessage: DeleteMessageInput[];
  // updatedAt also gets implicitly updated, but for the sake of my sanity in not wanting to do any more type-massaging
  // and the fact that we never explicitly use updatedAt anyways (we always update all the properties via Object.assign),
  // we don't need to strictly declare the type c:
  updateMessage: (Pick<MessageEntity, "isEdited"> & UpdateMessageInput)[];
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
