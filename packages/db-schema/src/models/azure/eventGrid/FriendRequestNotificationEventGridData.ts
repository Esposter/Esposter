import type { NotificationOptions } from "#src/models/azure/eventGrid/NotificationOptions";

import { notificationOptionsSchema } from "#src/models/azure/eventGrid/NotificationOptions";
import { z } from "zod";

export interface FriendRequestNotificationEventGridData {
  notificationOptions: NotificationOptions;
  receiverId: string;
}

export const friendRequestNotificationEventGridDataSchema = z.object({
  notificationOptions: notificationOptionsSchema,
  receiverId: z.string(),
}) satisfies z.ZodType<FriendRequestNotificationEventGridData>;
