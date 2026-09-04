import type { MessageEntity } from "#src/models/message/MessageEntity";
import type { Class } from "type-fest";

import { MessageType } from "#src/models/message/MessageType";
import { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";
import { WebhookMessageEntity } from "#src/models/message/WebhookMessageEntity";

export const MessageTypeEntityMap = {
  [MessageType.Call]: StandardMessageEntity,
  [MessageType.EditRoom]: StandardMessageEntity,
  [MessageType.Message]: StandardMessageEntity,
  [MessageType.PinMessage]: StandardMessageEntity,
  [MessageType.Poll]: StandardMessageEntity,
  [MessageType.System]: StandardMessageEntity,
  [MessageType.Webhook]: WebhookMessageEntity,
} as const satisfies Record<MessageType, Class<MessageEntity>>;
export type MessageTypeEntityMap = typeof MessageTypeEntityMap;
