import type { BaseMessageEntity } from "@/models/message/BaseMessageEntity";
import type { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";

export type MessageEntity = BaseMessageEntity | WebhookMessageEntity;
