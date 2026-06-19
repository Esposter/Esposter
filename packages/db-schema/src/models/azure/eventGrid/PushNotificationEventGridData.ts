import type { MessageEntity } from "@/models/message/MessageEntity";

import { standardMessageEntitySchema } from "@/models/message/StandardMessageEntity";
import { webhookMessageEntitySchema } from "@/models/message/WebhookMessageEntity";
import { z } from "zod";

export interface PushNotificationEventGridData {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: {
    icon?: null | string;
    title?: null | string;
  };
}

const pushNotificationMessageFields = { message: true, partitionKey: true, rowKey: true, userId: true } as const;

export const pushNotificationEventGridDataSchema = z.object({
  // Mirrors Pick<MessageEntity, ...> which distributes to the standard | webhook union;
  // Standard messages carry a userId, webhook messages never do
  message: z.union([
    standardMessageEntitySchema.pick(pushNotificationMessageFields),
    webhookMessageEntitySchema.pick(pushNotificationMessageFields),
  ]),
  notificationOptions: z.object({
    icon: z.string().nullish(),
    title: z.string().nullish(),
  }),
}) satisfies z.ZodType<PushNotificationEventGridData>;
