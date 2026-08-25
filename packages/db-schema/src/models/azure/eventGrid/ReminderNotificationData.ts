import type { ItemEntityType } from "@esposter/shared";

import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { z } from "zod";

// A /remind reminder, self-addressed: the recipient is the member who set it, and the deep link is the room it
// Was set in.
export interface ReminderNotificationData extends ItemEntityType<AppNotificationType.Reminder> {
  roomId: string;
  text: string;
  userId: string;
}

export const reminderNotificationDataSchema = z.object({
  roomId: z.string(),
  text: z.string(),
  type: z.literal(AppNotificationType.Reminder).readonly(),
  userId: z.string(),
}) satisfies z.ZodType<ReminderNotificationData>;
