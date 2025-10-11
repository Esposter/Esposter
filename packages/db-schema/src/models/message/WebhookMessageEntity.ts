import type { AppUser } from "@/schema/appUsers";

import { BaseMessageEntity } from "@/models/message/BaseMessageEntity";
import { MessageType } from "@/models/message/MessageType";

export class WebhookMessageEntity extends BaseMessageEntity<MessageType.Webhook> {
  appUser!: AppUser;
  override type: MessageType.Webhook = MessageType.Webhook;
  // Webhook messages don't have a direct user author
  declare userId: never;
}
