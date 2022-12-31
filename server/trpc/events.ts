import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/routers/message";
import { MessageEntity } from "@/services/azure/types";
import { EventEmitter } from "events";

interface CustomEvents {
  onCreateMessage: (data: MessageEntity) => void;
  onUpdateMessage: (data: UpdateMessageInput) => void;
  onDeleteMessage: (data: DeleteMessageInput) => void;
}

interface CustomEventEmitter {
  on<T extends keyof CustomEvents>(event: T, listener: CustomEvents[T]): this;
  off<T extends keyof CustomEvents>(event: T, listener: CustomEvents[T]): this;
  once<T extends keyof CustomEvents>(event: T, listener: CustomEvents[T]): this;
  emit<T extends keyof CustomEvents>(event: T, ...args: Parameters<CustomEvents[T]>): boolean;
}

class CustomEventEmitter extends EventEmitter {}

export const customEventEmitter = new CustomEventEmitter();
