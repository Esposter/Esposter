import type { InvocationContext } from "@azure/functions";
import type { FriendRequestNotificationEventGridData } from "@esposter/db-schema";

import { db } from "@/services/db";
import { webpush } from "@/services/webpush";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { pushSubscriptionsInMessage } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

export const friendRequestNotification = async (
  context: InvocationContext,
  { notificationOptions: { icon, title }, receiverId }: FriendRequestNotificationEventGridData,
): Promise<void> => {
  const readPushSubscriptions = await getPushSubscriptionsForUser(db, receiverId);
  if (readPushSubscriptions.length === 0) {
    context.log(`No push subscriptions found for user ${receiverId}.`);
    return;
  }

  const payload = JSON.stringify({
    body: "sent you a friend request",
    data: { url: `${process.env.BASE_URL}${RoutePath.MessagesFriends}` },
    icon,
    title,
  });

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
              context.log(`Subscription for endpoint ${endpoint} has expired. Deleting.`);
              await db.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.id, id));
            } else context.error(`Failed to send push notification to ${endpoint}: `, error);
          else context.error(`Unexpected error sending push notification to ${endpoint}: `, error);
        }
      })(),
    ),
  );
};
