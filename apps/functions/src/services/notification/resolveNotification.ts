import type { InvocationContext } from "@azure/functions";
import type { NotificationEventGridData } from "@esposter/db-schema";

import { db } from "#src/services/db";
import { getMessageNotificationAuthor } from "#src/services/notification/getMessageNotificationAuthor";
import { getMessageNotificationBody } from "#src/services/notification/getMessageNotificationBody";
import { getMessageRecipientUserIds } from "@esposter/db";
import { AppNotificationType } from "@esposter/db-schema";
import { exhaustiveGuard, RoutePath } from "@esposter/shared";

export interface ResolvedNotification {
  body: string;
  icon?: null | string;
  path: string;
  title: string;
  userIds: string[];
}

// The one place a published occurrence becomes a rendered notification and a recipient list. Every type answers
// The same questions — what it says, where it goes, whose it is — so the delivery below it never branches on type
// Again: it reads AppNotificationTypeChannelMap and fans out.
//
// Undefined means there is nothing to deliver, which only a message can be: everything else knows its own copy.
export const resolveNotification = async (
  context: InvocationContext,
  data: NotificationEventGridData,
): Promise<ResolvedNotification | undefined> => {
  switch (data.type) {
    case AppNotificationType.FriendRequest: {
      const sender = await db.query.users.findFirst({
        columns: { image: true, name: true },
        where: { id: { eq: data.senderId } },
      });
      return {
        body: "sent you a friend request",
        icon: sender?.image,
        path: RoutePath.MessagesFriends,
        title: sender?.name ?? "",
        userIds: [data.receiverId],
      };
    }
    case AppNotificationType.Message: {
      const body = getMessageNotificationBody(context, data.message.message);
      // Cheapest possible rejection first: a message that renders to nothing has no recipients worth resolving
      if (!body) return undefined;

      const { partitionKey, rowKey, userId } = data.message;
      // Independent reads, so they overlap rather than queue — the author display never depends on who receives it
      const [author, userIds] = await Promise.all([
        getMessageNotificationAuthor({ appUserId: data.appUserId, roomId: partitionKey, userId }),
        getMessageRecipientUserIds(db, {
          message: data.message.message,
          partitionKey,
          threadRootRowKey: data.threadRootRowKey,
          userId,
        }),
      ]);
      return {
        body,
        icon: author.icon,
        // A reply deep-links to the thread it belongs to rather than to itself: the thread is where the reply is
        // Read, and it is the one destination that is right for a room member and a thread follower alike
        path: RoutePath.MessagesMessage(partitionKey, data.threadRootRowKey ?? rowKey),
        title: author.title,
        userIds,
      };
    }
    case AppNotificationType.Reminder:
      return {
        body: data.text,
        path: RoutePath.Messages(data.roomId),
        title: "Reminder",
        userIds: [data.userId],
      };
    case AppNotificationType.ResourceOperation:
      return {
        body: data.body ?? "",
        path: data.path,
        title: data.title,
        userIds: [data.userId],
      };
    case AppNotificationType.TodoReminder:
      return {
        body: `『${data.itemName}』 is due`,
        path: RoutePath.ResourceItems(data.resourceId),
        title: "Todo reminder",
        userIds: [data.userId],
      };
    default:
      return exhaustiveGuard(data);
  }
};
