import type { NotificationOptions } from "#src/models/azure/eventGrid/NotificationOptions";
import type { MessageEntity } from "#src/models/message/MessageEntity";

import { notificationOptionsSchema } from "#src/models/azure/eventGrid/NotificationOptions";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { webhookMessageEntitySchema } from "#src/models/message/WebhookMessageEntity";
import { z } from "zod";

export interface PushNotificationEventGridData {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: NotificationOptions;
}

const pushNotificationMessageFields = { message: true, partitionKey: true, rowKey: true, userId: true } as const;

export const pushNotificationEventGridDataSchema = z.object({
  // Mirrors Pick<MessageEntity, ...> which distributes to the standard | webhook union;
  // Standard messages carry a userId, webhook messages never do
  message: z.union([
    standardMessageEntitySchema.pick(pushNotificationMessageFields),
    webhookMessageEntitySchema.pick(pushNotificationMessageFields),
  ]),
  notificationOptions: notificationOptionsSchema,
}) satisfies z.ZodType<PushNotificationEventGridData>;
