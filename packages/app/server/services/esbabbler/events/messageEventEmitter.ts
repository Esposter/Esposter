import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/routers/message";
import type { MessageEntity } from "@/shared/models/esbabbler/message";

import EventEmitter from "eventemitter3";

interface MessageEvents {
  createMessage: (data: MessageEntity) => void;
  deleteMessage: (data: DeleteMessageInput) => void;
  updateMessage: (data: UpdateMessageInput) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
