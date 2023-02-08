import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { MessageEntity } from "@/models/azure/message";
import EventEmitter from "eventemitter3";

interface MessageEvents {
  onCreateMessage: (data: MessageEntity) => void;
  onUpdateMessage: (data: AzureUpdateEntity<MessageEntity>) => void;
  onDeleteMessage: (data: CompositeKey) => void;
}

export const messageEventEmitter = new EventEmitter<MessageEvents>();
