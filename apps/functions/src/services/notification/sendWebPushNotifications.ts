import type { InvocationContext } from "@azure/functions";
import type { PushSubscriptionInNotification } from "@esposter/db-schema";

import { MAX_CONCURRENT_PUSH_SENDS } from "#src/services/notification/constants";
import { webpush } from "#src/services/notification/webpush";
import { db } from "#src/services/shared/db";
import { pushSubscriptionsInNotification } from "@esposter/db-schema";
import { getResultAsync, noop, settleAll } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

export const sendWebPushNotifications = async (
  context: InvocationContext,
  subscriptions: Pick<PushSubscriptionInNotification, "auth" | "endpoint" | "expirationTime" | "id" | "p256dh">[],
  payload: string,
): Promise<void> => {
  await settleAll(
    subscriptions.map(
      ({ auth, endpoint, expirationTime, id, p256dh }) =>
        () =>
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
                  db.delete(pushSubscriptionsInNotification).where(eq(pushSubscriptionsInNotification.id, id)),
                ).match(noop, (deleteError) => {
                  context.error(`Failed to delete expired subscription ${endpoint}: `, deleteError);
                });
              } else context.error(`Failed to send push notification to ${endpoint}: `, error);
            else context.error(`Unexpected error sending push notification to ${endpoint}: `, error);
          }),
    ),
    MAX_CONCURRENT_PUSH_SENDS,
  );
};
