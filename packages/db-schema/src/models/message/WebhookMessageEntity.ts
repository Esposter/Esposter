import type { CompositeKeyEntity } from "@/models/azure/table/CompositeKeyEntity";
import type { AppUserInMessage } from "@/schema/appUsersInMessage";
import type { ToData } from "@esposter/shared";
import type { Except, SetOptional } from "type-fest";

import { BaseMessageEntity, baseMessageEntitySchema } from "@/models/message/BaseMessageEntity";
import { MessageType } from "@/models/message/MessageType";
import { selectAppUserInMessageSchema } from "@/schema/appUsersInMessage";
import { z } from "zod";

export class WebhookMessageEntity extends BaseMessageEntity<MessageType.Webhook> {
  appUser: SetOptional<Pick<AppUserInMessage, "id" | "image" | "name">, "image" | "name">;
  override type: MessageType.Webhook = MessageType.Webhook;
  // Webhook messages don't have a direct user author
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
