import type { StandardMessageEntity } from "@/models/message/StandardMessageEntity";
import type { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";

export type MessageEntity = StandardMessageEntity | WebhookMessageEntity;
