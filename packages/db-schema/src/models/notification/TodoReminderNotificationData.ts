import type { ItemEntityType } from "@esposter/shared";

import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { z } from "zod";

export interface TodoReminderNotificationData extends ItemEntityType<AppNotificationType.TodoReminder> {
  itemName: string;
  resourceId: string;
  userId: string;
}

export const todoReminderNotificationDataSchema = z.object({
  itemName: z.string(),
  resourceId: z.string(),
  type: z.literal(AppNotificationType.TodoReminder).readonly(),
  userId: z.string(),
}) satisfies z.ZodType<TodoReminderNotificationData>;
