import type { MessageEntity } from "@esposter/db-schema";

import { deserializeKey } from "@esposter/azure";
import { MessageType, StandardMessageEntity, WebhookMessageEntity } from "@esposter/db-schema";

// A search document holds the entity under serialized keys, so deserializing is a rename of the ones
// SerializeKey capitalized. A runtime key rename is the part the compiler cannot follow — Object.fromEntries
// Types it as a bare Record, which overlaps no entity class, so the shape has to be restated here. What it is
// Restated to is not a guess: the index's own document type pins it, and the type field is checked below
export const deserializeMessageSearchDocument = (document: MessageEntity): MessageEntity => {
  const message = Object.fromEntries(
    Object.entries(document).map(([key, value]) => [deserializeKey(key), value]),
  ) as unknown as MessageEntity;
  return message.type === MessageType.Webhook ? new WebhookMessageEntity(message) : new StandardMessageEntity(message);
};
