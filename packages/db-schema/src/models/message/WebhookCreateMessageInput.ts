import type { StandardCreateMessageInput } from "@/models/message/StandardCreateMessageInput";
import type { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";
import type { ItemEntityType } from "@esposter/shared";
import type { Except } from "type-fest";

import { MessageType } from "@/models/message/MessageType";

export interface WebhookCreateMessageInput
  extends Except<StandardCreateMessageInput, "type">, ItemEntityType<MessageType.Webhook> {
  appUser: WebhookMessageEntity["appUser"];
}
