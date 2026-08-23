import type { InvocationContext } from "@azure/functions";

import { db } from "#src/services/db";
import { webpush } from "#src/services/webpush";
import { pushSubscriptionsInMessage } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

export const sendWebPushNotifications = async (
  context: InvocationContext,
  subscriptions: { auth: string; endpoint: string; expirationTime: Date | null; id: string; p256dh: string }[],
  payload: string,
): Promise<void> => {
  await Promise.all(
    subscriptions.map(({ auth, endpoint, expirationTime, id, p256dh }) =>
      getResultAsync(() =>
        webpush.sendNotification(
          { endpoint, expirationTime: expirationTime ? expirationTime.getTime() : null, keys: { auth, p256dh } },
          payload,
        ),
      ).match(noop, async (error) => {
        if (error instanceof WebPushError)
          if (error.statusCode === 410) {
            context.log(`Subscription for endpoint ${endpoint} has expired. Deleting.`);
            await getResultAsync(() =>
              db.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.id, id)),
            ).match(noop, (deleteError) => {
              context.error(`Failed to delete expired subscription ${endpoint}: `, deleteError);
            });
          } else context.error(`Failed to send push notification to ${endpoint}: `, error);
        else context.error(`Unexpected error sending push notification to ${endpoint}: `, error);
      }),
    ),
  );
};
