import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { AppUserInMessage } from "@/schema/appUsersInMessage";
import type { ToData } from "@esposter/shared";
import type { SetOptional } from "type-fest";

import { BaseMessageEntity } from "@/models/message/BaseMessageEntity";
import { MessageType } from "@/models/message/MessageType";

export class WebhookMessageEntity extends BaseMessageEntity<MessageType.Webhook> {
  appUser: SetOptional<Pick<AppUserInMessage, "id" | "image" | "name">, "image" | "name">;
  override type: MessageType.Webhook = MessageType.Webhook;
  // Webhook messages don't have a direct user author
  userId?: undefined;

  constructor(init: Partial<WebhookMessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
    this.appUser = init.appUser ?? { id: "" };
  }
}
