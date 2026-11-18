import type { PushSubscriptionInNotification } from "@esposter/db-schema";

import { DEAD_PUSH_SUBSCRIPTION_STATUS_CODES, MAX_CONCURRENT_PUSH_SENDS } from "#src/services/notification/constants";
import { webpush } from "#src/services/notification/webpush";
import { db } from "#src/services/shared/db";
import { pushSubscriptionsInNotification } from "@esposter/db-schema";
import { getResultAsync, noop, settleAll } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

export const sendWebPushNotifications = async (
  subscriptions: Pick<PushSubscriptionInNotification, "auth" | "endpoint" | "expirationTime" | "id" | "p256dh">[],
  payload: string,
): Promise<void> => {
  await settleAll(
    subscriptions.map(({ auth, endpoint, expirationTime, id, p256dh }) => async () => {
      await getResultAsync(() =>
        webpush.sendNotification(
          { endpoint, expirationTime: expirationTime ? expirationTime.getTime() : null, keys: { auth, p256dh } },
          payload,
        ),
      ).match(noop, async (error) => {
        if (error instanceof WebPushError)
          if (DEAD_PUSH_SUBSCRIPTION_STATUS_CODES.includes(error.statusCode)) {
            console.log(`Subscription for endpoint ${endpoint} is dead (${error.statusCode}). Deleting.`);
            await getResultAsync(() =>
              db.delete(pushSubscriptionsInNotification).where(eq(pushSubscriptionsInNotification.id, id)),
            ).match(noop, (deleteError) => {
              console.error(`Failed to delete dead subscription ${endpoint}:`, deleteError);
            });
          } else console.error(`Failed to send push notification to ${endpoint}:`, error);
        else console.error(`Unexpected error sending push notification to ${endpoint}:`, error);
      });
    }),
    MAX_CONCURRENT_PUSH_SENDS,
  );
};
