import type { RoomMessage } from "#src/models/realtime/RoomMessage";
import type { ItemEntityType } from "@esposter/shared";

import { roomIdSchema } from "#src/models/shared/RoomId";
import { roomMessageSchema } from "#src/models/realtime/RoomMessage";
import { AppNotificationType } from "#src/models/notification/AppNotificationType";
import { z } from "zod";

// One event for every message, thread reply included: threadRootId is what a reply adds, and it widens the
// Recipient set (the thread's followers on top of the room's) rather than raising a second event, which would
// Notify anyone following both the thread and the room twice.
//
// The author is carried as an id, never as a resolved name and avatar. A message send is a request the member is
// Waiting on, and the displayName lookup that renders the notification has no business being on it — the Function
// Resolves it, once, in the one place that already has to read the room.
export interface MessageNotificationData extends ItemEntityType<AppNotificationType.Message> {
  // A webhook message has no `userId`; this is the app user that posted on the webhook's behalf.
  appUserId?: string;
  message: Pick<RoomMessage, "id" | "message" | "userId"> & { roomId: string };
  // The integer id of the thread's root when this message is a reply — the follow key and the deep-link target.
  threadRootId: RoomMessage["replyToId"];
}

export const messageNotificationDataSchema = z.object({
  appUserId: z.string().optional(),
  message: roomMessageSchema.pick({ id: true, message: true, userId: true }).safeExtend(roomIdSchema.shape),
  threadRootId: roomMessageSchema.shape.replyToId,
  type: z.literal(AppNotificationType.Message).readonly(),
}) satisfies z.ZodType<MessageNotificationData>;
