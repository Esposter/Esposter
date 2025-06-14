import type { CreateTypingInput } from "#shared/models/db/message/CreateTypingInput";
import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";
import type { DeviceId } from "@@/server/models/auth/DeviceId";
import type { Session } from "@@/server/models/auth/Session";

import { EventEmitter } from "node:events";

interface MessageEvents {
  createMessage: [
    MessageEntity[],
    Pick<DeviceId, "sessionId"> & Pick<Session["user"], "image" | "name"> & { isSendToSelf?: true },
  ][];
  // We'll allow typing events to also be propagated to separate devices of the same account
  // Why? Because we can. (also it's better UX I suppose)
  createTyping: (CreateTypingInput & Pick<DeviceId, "sessionId">)[];
  deleteMessage: DeleteMessageInput[];
  // updatedAt also gets implicitly updated, but for the sake of my sanity in not wanting to do any more type-massaging
  // and the fact that we never explicitly use updatedAt anyways (we always update all the properties via Object.assign),
  // we don't need to strictly declare the type c:
  updateMessage: (Pick<MessageEntity, "isEdited"> & UpdateMessageInput)[];
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
