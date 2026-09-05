import type { MessageEntity } from "#src/models/message/MessageEntity";
import type { ItemEntityType } from "@esposter/shared";

import { standardMessageEntitySchema } from "#src/models/message/StandardMessageEntity";
import { webhookMessageEntitySchema } from "#src/models/message/WebhookMessageEntity";
import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { z } from "zod";

// One event for every message, thread reply included: threadRootRowKey is what a reply adds, and it widens the
// Recipient set (the thread's followers on top of the room's) rather than raising a second event, which would
// Notify anyone following both the thread and the room twice.
//
// The author is carried as an id, never as a resolved name and avatar. A message send is a request the member is
// Waiting on, and the nickname lookup that renders the notification has no business being on it — the Function
// Resolves it, once, in the one place that already has to read the room.
export interface MessageNotificationData extends ItemEntityType<AppNotificationType.Message> {
  // A webhook message has no `userId`; this is the app user that posted on the webhook's behalf.
  appUserId?: string;
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  // The rowKey of the thread's root when this message is a reply — the follow key and the deep-link target.
  threadRootRowKey?: string;
}

const messageNotificationFields = { message: true, partitionKey: true, rowKey: true, userId: true } as const;

export const messageNotificationDataSchema = z.object({
  appUserId: z.string().optional(),
  // Mirrors Pick<MessageEntity, ...> which distributes to the standard | webhook union;
  // Standard messages carry a userId, webhook messages never do
  message: z.union([
    standardMessageEntitySchema.pick(messageNotificationFields),
    webhookMessageEntitySchema.pick(messageNotificationFields),
  ]),
  threadRootRowKey: z.string().optional(),
  type: z.literal(AppNotificationType.Message).readonly(),
}) satisfies z.ZodType<MessageNotificationData>;
