import type { CompositeKeyEntity } from "#src/models/azure/table/CompositeKeyEntity";
import type { AppUserInMessage } from "#src/schema/appUsersInMessage";
import type { ToData } from "@esposter/shared";
import type { Except, SetOptional } from "type-fest";

import { BaseMessageEntity, baseMessageEntitySchema } from "#src/models/message/BaseMessageEntity";
import { MessageType } from "#src/models/message/MessageType";
import { selectAppUserInMessageSchema } from "#src/schema/appUsersInMessage";
import { z } from "zod";

export class WebhookMessageEntity extends BaseMessageEntity<MessageType.Webhook> {
  appUser: SetOptional<Pick<AppUserInMessage, "id" | "image" | "name">, "image" | "name">;
  override type: MessageType.Webhook = MessageType.Webhook;
  userId?: undefined;

  constructor(init?: Partial<WebhookMessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
    this.appUser = init?.appUser ?? { id: "" };
  }
}

export const webhookMessageEntitySchema = z.object({
  ...baseMessageEntitySchema.shape,
  appUser: z.object({
    ...selectAppUserInMessageSchema.pick({ id: true, image: true, name: true }).shape,
    image: selectAppUserInMessageSchema.shape.image.optional(),
    name: selectAppUserInMessageSchema.shape.name.optional(),
  }),
  type: z.literal(MessageType.Webhook),
  // Webhook messages have no direct user author, so userId is always absent
  userId: z.undefined().optional(),
}) satisfies z.ZodType<ToData<Except<WebhookMessageEntity, "linkPreviewResponse">>>;
