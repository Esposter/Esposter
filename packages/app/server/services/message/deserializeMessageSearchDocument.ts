import type { MessageEntity } from "@esposter/db-schema";

import { deserializeKey } from "@esposter/db";
import { MessageType, StandardMessageEntity, WebhookMessageEntity } from "@esposter/db-schema";

export const deserializeMessageSearchDocument = (document: MessageEntity): MessageEntity => {
  const message = Object.fromEntries(
    Object.entries(document).map(([key, value]) => [deserializeKey(key), value]),
  ) as unknown as MessageEntity;
  return message.type === MessageType.Webhook ? new WebhookMessageEntity(message) : new StandardMessageEntity(message);
};
