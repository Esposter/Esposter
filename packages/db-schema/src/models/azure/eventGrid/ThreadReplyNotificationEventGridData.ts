import type { NotificationOptions } from "#src/models/azure/eventGrid/NotificationOptions";
import type { StandardMessageEntity } from "#src/models/message/StandardMessageEntity";

import { notificationOptionsSchema } from "#src/models/azure/eventGrid/NotificationOptions";
import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { z } from "zod";

export interface ThreadReplyNotificationEventGridData {
  message: Pick<StandardMessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: NotificationOptions;
  // The rowKey of the thread's root message — the follow key and the notification's deep-link target.
  threadRootRowKey: string;
}

export const threadReplyNotificationEventGridDataSchema = z.object({
  message: standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true, userId: true }),
  notificationOptions: notificationOptionsSchema,
  threadRootRowKey: z.string(),
}) satisfies z.ZodType<ThreadReplyNotificationEventGridData>;
