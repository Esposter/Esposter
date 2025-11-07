import type { InvocationContext } from "@azure/functions";
import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { db } from "@/services/db";
import { getCreateMessageNotificationPayload } from "@/services/getCreateMessageNotificationPayload";
import { webpush } from "@/services/webpush";
import { pushSubscriptions } from "@esposter/db-schema";
import { getPushSubscriptionsForMessage } from "@esposter/db-schema/src/services/message/getPushSubscriptionsForMessage";
import { RoutePath } from "@esposter/shared";
import { eq } from "drizzle-orm";
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

  const readPushSubscriptions = await getPushSubscriptionsForMessage(db, { message, partitionKey, userId });
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
