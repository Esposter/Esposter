import type { MessageEntity } from "#shared/models/esbabbler/message";
import type { DeleteMessageInput } from "#shared/models/esbabbler/message/DeleteMessageInput";
import type { UpdateMessageInput } from "#shared/models/esbabbler/message/UpdateMessageInput";

import EventEmitter from "eventemitter3";

interface MessageEvents {
  createMessage: (data: MessageEntity) => void;
  deleteMessage: (data: DeleteMessageInput) => void;
  updateMessage: (data: UpdateMessageInput) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
