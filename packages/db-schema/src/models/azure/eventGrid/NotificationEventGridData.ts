import type { FriendRequestNotificationData } from "#src/models/azure/eventGrid/FriendRequestNotificationData";
import type { MessageNotificationData } from "#src/models/azure/eventGrid/MessageNotificationData";
import type { ReminderNotificationData } from "#src/models/azure/eventGrid/ReminderNotificationData";
import type { ResourceOperationNotificationData } from "#src/models/azure/eventGrid/ResourceOperationNotificationData";
import type { TodoReminderNotificationData } from "#src/models/azure/eventGrid/TodoReminderNotificationData";

import { friendRequestNotificationDataSchema } from "#src/models/azure/eventGrid/FriendRequestNotificationData";
import { messageNotificationDataSchema } from "#src/models/azure/eventGrid/MessageNotificationData";
import { reminderNotificationDataSchema } from "#src/models/azure/eventGrid/ReminderNotificationData";
import { resourceOperationNotificationDataSchema } from "#src/models/azure/eventGrid/ResourceOperationNotificationData";
import { todoReminderNotificationDataSchema } from "#src/models/azure/eventGrid/TodoReminderNotificationData";
import { z } from "zod";

// The one payload every notification in this system is published as. Publishers state what happened and who it
// Concerns; ProcessNotification resolves the recipients, the copy it can resolve, and the surfaces to deliver to.
// Each member carries exactly what its own recipient resolution needs and nothing more.
export type NotificationEventGridData =
  | FriendRequestNotificationData
  | MessageNotificationData
  | ReminderNotificationData
  | ResourceOperationNotificationData
  | TodoReminderNotificationData;

export const notificationEventGridDataSchema = z.discriminatedUnion("type", [
  friendRequestNotificationDataSchema,
  messageNotificationDataSchema,
  reminderNotificationDataSchema,
  resourceOperationNotificationDataSchema,
  todoReminderNotificationDataSchema,
]) satisfies z.ZodType<NotificationEventGridData>;
