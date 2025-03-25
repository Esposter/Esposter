import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";

import { EventEmitter } from "node:events";

interface MessageEvents {
  createMessage: MessageEntity[];
  deleteMessage: DeleteMessageInput[];
  updateMessage: UpdateMessageInput[];
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
