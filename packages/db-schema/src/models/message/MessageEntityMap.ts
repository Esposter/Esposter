import type { BaseMessageEntity } from "@/models/message/BaseMessageEntity";
import type { MessageType } from "@/models/message/MessageType";
import type { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";

export interface MessageEntityMap {
  [MessageType.EditRoom]: BaseMessageEntity;
  [MessageType.Message]: BaseMessageEntity;
  [MessageType.PinMessage]: BaseMessageEntity;
  [MessageType.Webhook]: WebhookMessageEntity;
}
