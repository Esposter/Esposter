import type { StandardCreateMessageInput } from "#src/models/message/StandardCreateMessageInput";
import type { WebhookMessageEntity } from "#src/models/message/WebhookMessageEntity";
import type { ItemEntityType } from "@esposter/shared";
import type { Except } from "type-fest";

import { MessageType } from "#src/models/message/MessageType";

export interface WebhookCreateMessageInput
  extends Except<StandardCreateMessageInput, "type">, ItemEntityType<MessageType.Webhook> {
  appUser: WebhookMessageEntity["appUser"];
}
