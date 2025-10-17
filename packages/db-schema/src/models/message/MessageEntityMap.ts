import type { MessageType } from "@/models/message/MessageType";
import type { StandardMessageEntity } from "@/models/message/StandardMessageEntity";
import type { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";

export interface MessageEntityMap {
  [MessageType.EditRoom]: StandardMessageEntity;
  [MessageType.Message]: StandardMessageEntity;
  [MessageType.PinMessage]: StandardMessageEntity;
  [MessageType.Webhook]: WebhookMessageEntity;
}
