import type { FriendRequestNotificationData } from "#src/models/notification/FriendRequestNotificationData";
import type { MessageNotificationData } from "#src/models/notification/MessageNotificationData";
import type { ReminderNotificationData } from "#src/models/notification/ReminderNotificationData";
import type { ResourceOperationNotificationData } from "#src/models/notification/ResourceOperationNotificationData";
import type { TodoReminderNotificationData } from "#src/models/notification/TodoReminderNotificationData";

import { friendRequestNotificationDataSchema } from "#src/models/notification/FriendRequestNotificationData";
import { messageNotificationDataSchema } from "#src/models/notification/MessageNotificationData";
import { reminderNotificationDataSchema } from "#src/models/notification/ReminderNotificationData";
import { resourceOperationNotificationDataSchema } from "#src/models/notification/ResourceOperationNotificationData";
import { todoReminderNotificationDataSchema } from "#src/models/notification/TodoReminderNotificationData";
import { queueMessageEnvelopeSchema } from "#src/models/queue/QueueMessageEnvelope";
import { z } from "zod";

// The one message every notification in this system is sent as. Publishers state what happened and who it
// Concerns; ProcessNotification resolves the recipients, the copy it can resolve, and the surfaces to deliver to.
// Each member carries exactly what its own recipient resolution needs and nothing more.
export type NotificationQueueMessage =
  | FriendRequestNotificationData
  | MessageNotificationData
  | ReminderNotificationData
  | ResourceOperationNotificationData
  | TodoReminderNotificationData;

// The envelope sits beside the union rather than inside its members, which are notification models that no queue field
// belongs in
export const notificationQueueMessageSchema = z.intersection(
  z.discriminatedUnion("type", [
    friendRequestNotificationDataSchema,
    messageNotificationDataSchema,
    reminderNotificationDataSchema,
    resourceOperationNotificationDataSchema,
    todoReminderNotificationDataSchema,
  ]),
  queueMessageEnvelopeSchema,
) satisfies z.ZodType<NotificationQueueMessage>;
