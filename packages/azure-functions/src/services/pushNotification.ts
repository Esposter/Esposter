import type { InvocationContext } from "@azure/functions";
import type { PushNotificationEventGridData } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { db } from "@/services/db";
import { getCreateMessageNotificationPayload } from "@/services/getCreateMessageNotificationPayload";
import { webpush } from "@/services/webpush";
import { NotificationType, pushSubscriptions, usersToRooms } from "@esposter/db-schema";
import { getMentions, MENTION_ID_ATTRIBUTE, RoutePath } from "@esposter/shared";
import { and, eq, inArray, ne, or } from "drizzle-orm";
import { WebPushError } from "web-push";

export const pushNotification = async (
  context: InvocationContext,
  {
    message: { message, partitionKey, rowKey, userId },
    notificationOptions: { icon, title },
  }: PushNotificationEventGridData,
): Promise<void> => {
  const payload = getCreateMessageNotificationPayload(message, {
    icon,
    title,
    url: `${process.env.BASE_URL}${RoutePath.MessagesMessage(partitionKey, rowKey)}`,
  });
  if (!payload) return;

  const andWheres: (SQL | undefined)[] = [eq(usersToRooms.roomId, partitionKey)];
  if (userId) andWheres.push(ne(usersToRooms.userId, userId));

  const mentionOrWheres: (SQL | undefined)[] = [eq(usersToRooms.notificationType, NotificationType.All)];
  const mentions = getMentions(message);
  if (mentions.length > 0)
    mentionOrWheres.push(
      and(
        eq(usersToRooms.notificationType, NotificationType.DirectMessage),
        inArray(
          usersToRooms.userId,
          mentions.map((m) => m.getAttribute(MENTION_ID_ATTRIBUTE)).filter((id) => id !== undefined),
        ),
      ),
    );
  andWheres.push(or(...mentionOrWheres));

  const readPushSubscriptions = await db
    .select({
      auth: pushSubscriptions.auth,
      endpoint: pushSubscriptions.endpoint,
      expirationTime: pushSubscriptions.expirationTime,
      id: pushSubscriptions.id,
      p256dh: pushSubscriptions.p256dh,
    })
    .from(pushSubscriptions)
    .innerJoin(usersToRooms, eq(usersToRooms.userId, pushSubscriptions.userId))
    .where(and(...andWheres));
  if (readPushSubscriptions.length === 0) {
    context.log(`No push subscriptions found for room ${partitionKey}.`);
    return;
  }

  await Promise.all(
    readPushSubscriptions.map(({ auth, endpoint, expirationTime, id, p256dh }) =>
      (async () => {
        try {
          await webpush.sendNotification(
            { endpoint, expirationTime: expirationTime ? expirationTime.getTime() : null, keys: { auth, p256dh } },
            payload,
          );
        } catch (error) {
          if (error instanceof WebPushError)
            if (error.statusCode === 410) {
              // A 410 GONE status means the subscription is no longer valid and should be deleted
              context.log(`Subscription for endpoint ${endpoint} has expired. Deleting.`);
              await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
            } else context.error(`Failed to send push notification to ${endpoint}: `, error);
        }
      })(),
    ),
  );
};
