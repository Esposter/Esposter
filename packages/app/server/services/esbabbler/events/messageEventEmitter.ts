import type { DeleteMessageInput } from "#shared/models/db/message/DeleteMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { UpdateMessageInput } from "#shared/models/db/message/UpdateMessageInput";

import EventEmitter from "eventemitter3";

interface MessageEvents {
  createMessage: (data: MessageEntity) => void;
  deleteMessage: (data: DeleteMessageInput) => void;
  updateMessage: (data: UpdateMessageInput) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
