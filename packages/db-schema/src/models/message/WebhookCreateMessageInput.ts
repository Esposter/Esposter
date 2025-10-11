import type { BaseCreateMessageInput } from "@/models/message/BaseCreateMessageInput";
import type { AppUser } from "@/schema/appUsers";
import type { ItemEntityType } from "@esposter/shared";
import type { Except } from "type-fest";

import { MessageType } from "@/models/message/MessageType";

export interface WebhookCreateMessageInput
  extends Except<BaseCreateMessageInput, "type">,
    ItemEntityType<MessageType.Webhook> {
  appUser: AppUser;
}
