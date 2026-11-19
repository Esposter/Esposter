import type { PushSubscriptionInNotification } from "@esposter/db-schema";

import { DEAD_PUSH_SUBSCRIPTION_STATUS_CODES, MAX_CONCURRENT_PUSH_SENDS } from "#src/services/notification/constants";
import { webpush } from "#src/services/notification/webpush";
import { getDb } from "#src/services/shared/getDb";
import { isPushServiceEndpoint, pushSubscriptionsInNotification } from "@esposter/db-schema";
import { getResultAsync, noop, settleAll } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

export const sendWebPushNotifications = async (
  subscriptions: Pick<PushSubscriptionInNotification, "auth" | "endpoint" | "expirationTime" | "id" | "p256dh">[],
  payload: string,
): Promise<void> => {
  await settleAll(
    subscriptions.map(({ auth, endpoint, expirationTime, id, p256dh }) => async () => {
      // A stored endpoint off the push services is never POSTed to. The subscribe input refuses one, so a row that fails
      // Here was written before the rule or around it, and the request it would make is not the worker's to send
      if (!isPushServiceEndpoint(endpoint)) {
        console.error(`Refusing to send to ${endpoint}: it is not a browser's push service.`);
        return;
      }
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
              getDb().delete(pushSubscriptionsInNotification).where(eq(pushSubscriptionsInNotification.id, id)),
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
