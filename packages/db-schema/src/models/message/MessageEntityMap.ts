import type { MessageEntity } from "@/models/message/MessageEntity";
import type { Class } from "type-fest";

import { MessageType } from "@/models/message/MessageType";
import { StandardMessageEntity } from "@/models/message/StandardMessageEntity";
import { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";

export const MessageEntityMap = {
  [MessageType.EditRoom]: StandardMessageEntity,
  [MessageType.Message]: StandardMessageEntity,
  [MessageType.PinMessage]: StandardMessageEntity,
  [MessageType.Webhook]: WebhookMessageEntity,
} as const satisfies Record<MessageType, Class<MessageEntity>>;
export type MessageEntityMap = typeof MessageEntityMap;
