import type { MessageEntity } from "@/models/esbabbler/message";
import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/routers/message";
import EventEmitter from "eventemitter3";

interface MessageEvents {
  onCreateMessage: (data: MessageEntity) => void;
  onUpdateMessage: (data: UpdateMessageInput) => void;
  onDeleteMessage: (data: DeleteMessageInput) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
