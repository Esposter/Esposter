import type { MessageEntity } from "@/models/esbabbler/message";
import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/routers/message";
import EventEmitter from "eventemitter3";

interface MessageEvents {
  createMessage: (data: MessageEntity) => void;
  updateMessage: (data: UpdateMessageInput) => void;
  deleteMessage: (data: DeleteMessageInput) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
