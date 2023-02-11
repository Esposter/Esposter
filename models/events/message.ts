import type { MessageEntity } from "@/models/azure/message";
import type { CreateMessageInput, DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/routers/message";
import EventEmitter from "eventemitter3";

interface MessageEvents {
  onCreateMessage: (data: CreateMessageInput & MessageEntity) => void;
  onUpdateMessage: (data: UpdateMessageInput) => void;
  onDeleteMessage: (data: DeleteMessageInput) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
