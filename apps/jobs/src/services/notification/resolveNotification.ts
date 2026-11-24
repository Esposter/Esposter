import type { ResolvedNotification } from "#src/models/notification/ResolvedNotification";
import type { NotificationQueueMessage } from "@esposter/db-schema";

import { getMessageNotificationAuthor } from "#src/services/notification/getMessageNotificationAuthor";
import { getMessageNotificationBody } from "#src/services/notification/getMessageNotificationBody";
import { getDb } from "#src/services/shared/getDb";
import { getMessageRecipientUserIds } from "@esposter/db";
import { AppNotificationType, getLiveMembershipRelationalWhere } from "@esposter/db-schema";
import { exhaustiveGuard, RoutePath } from "@esposter/shared";

// The one place a published occurrence becomes a rendered notification and a recipient list. Every type answers
// The same questions — what it says, where it goes, whose it is — so the delivery below it never branches on type
// Again: it reads AppNotificationTypeChannelMap and fans out.
//
// Undefined means there is nothing to deliver: a message that renders to nothing, or a reminder with no room to open.
// Everything else knows its own copy.
export const resolveNotification = async (
  data: NotificationQueueMessage,
): Promise<ResolvedNotification | undefined> => {
  switch (data.type) {
    case AppNotificationType.FriendRequest: {
      const sender = await getDb().query.usersInAuth.findFirst({
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
      const body = getMessageNotificationBody(data.message.message);
      // Cheapest possible rejection first: a message that renders to nothing has no recipients worth resolving
      if (!body) return undefined;

      const { id, message: text, roomId, userId } = data.message;
      // A webhook message has no member sender, so its absent author is undefined rather than the row's null
      const senderUserId = userId ?? undefined;
      // Independent reads, so they overlap rather than queue — the author display never depends on who receives it
      const [author, userIds] = await Promise.all([
        getMessageNotificationAuthor({ appUserId: data.appUserId, roomId, userId: senderUserId }),
        getMessageRecipientUserIds(getDb(), {
          message: text,
          roomId,
          threadRootId: data.threadRootId,
          userId: senderUserId,
        }),
      ]);
      return {
        body,
        icon: author.icon,
        // A reply deep-links to the thread it belongs to rather than to itself: the thread is where the reply is
        // Read, and it is the one destination that is right for a room member and a thread follower alike
        path: RoutePath.MessagesMessage(roomId, data.threadRootId ?? id),
        title: author.title,
        userIds,
      };
    }
    case AppNotificationType.Reminder: {
      // A reminder is sent only while its owner is still a member of its room: a room that is gone has no room to open,
      // And an owner who left has no place to read it. The owner's object keeps a reminder whose removal failed, so
      // This is the check that holds at the one place a reminder is delivered. A membership cascades with its room, so
      // One read answers both
      const membership = await getDb().query.usersToRoomsInMessage.findFirst({
        columns: { userId: true },
        where: getLiveMembershipRelationalWhere(data.roomId, data.userId),
      });
      if (!membership) return undefined;

      return { body: data.text, path: RoutePath.Messages(data.roomId), title: "Reminder", userIds: [data.userId] };
    }
    case AppNotificationType.ResourceOperation:
      return { body: data.body ?? "", path: data.path, title: data.title, userIds: [data.userId] };
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
