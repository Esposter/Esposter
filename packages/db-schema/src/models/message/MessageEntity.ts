import type { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";
import type { WebhookMessageEntity } from "#src/models/message/WebhookMessageEntity";

export type MessageEntity = StandardMessageEntity | WebhookMessageEntity;
