import type { MessageEntity } from "@/models/message/MessageEntity";

import { standardMessageEntitySchema } from "@/models/message/StandardMessageEntity";
import { z } from "zod";

export interface PushNotificationEventGridData {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: {
    icon?: null | string;
    title?: null | string;
  };
}

export const pushNotificationEventGridDataSchema = z.object({
  message: standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true, userId: true }),
  notificationOptions: z.object({
    icon: z.string().nullish(),
    title: z.string().nullish(),
  }),
}) satisfies z.ZodType<PushNotificationEventGridData>;
