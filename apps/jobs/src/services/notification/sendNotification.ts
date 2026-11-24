import type { NotificationQueueMessage } from "@esposter/db-schema";

import { getPushNotificationPayload } from "#src/services/notification/getPushNotificationPayload";
import { resolveNotification } from "#src/services/notification/resolveNotification";
import { sendWebPushNotifications } from "#src/services/notification/sendWebPushNotifications";
import { getDb } from "#src/services/shared/getDb";
import { runUnit } from "#src/services/shared/runUnit";
import { getPushSubscriptionsForUsers, inJsonArray } from "@esposter/db";
import {
  AppNotificationTypeChannelMap,
  AppNotificationTypeSeverityMap,
  NOTIFICATION_RETENTION_MS,
  NotificationChannel,
  notificationsInNotification,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, isNull, lt } from "drizzle-orm";

// The whole fan-out, and the only place that decides where a notification lands. Recipient resolution is the one
// Thing that varies by type; everything past it reads the type's declared channels, so adding a notification is
// Adding a resolver case and a map entry rather than a Function, a subscription and a delivery path.
export const sendNotification = async (data: NotificationQueueMessage): Promise<void> => {
  const resolvedNotification = await resolveNotification(data);
  if (!resolvedNotification) {
    console.log(`Nothing to notify for ${data.type}.`);
    return;
  }

  const { body, icon, path, title, userIds } = resolvedNotification;
  if (userIds.length === 0) {
    console.log(`No recipients for ${data.type}.`);
    return;
  }

  const severity = AppNotificationTypeSeverityMap[data.type];
  const channels = AppNotificationTypeChannelMap[data.type];
  if (channels.includes(NotificationChannel.Bell)) {
    // One statement for every recipient: the bell is a row per user, and a notification with a hundred recipients
    // Is still one round trip. Its own unit publishes the bell's topics once the rows land, so the bell is woken before
    // The device push below waits on each device in turn
    await runUnit(() =>
      getDb()
        .insert(notificationsInNotification)
        .values(userIds.map((userId) => ({ body, path, severity, title, type: data.type, userId }))),
    );
    // The retention trim rides the write rather than a sweep of its own: the recipients are already known here, so
    // Bounding the table costs one indexed delete against the rows that were just added to. Best-effort, because it
    // Runs after the rows above have landed — a throw here would ask the queue for a redelivery that inserts them a
    // Second time, which is the duplication QueueJobMaxRetriesMap promises this Handler does not cause.
    // A live row is kept for the retention counted from its creation. A dismissal is a tombstone the nightly purge
    // Removes on its own retention, so the trim takes live rows only and leaves a tombstone to the purge
    // Rather than duplicating it
    const retentionCutoff = new Date(Date.now() - NOTIFICATION_RETENTION_MS);
    await getResultAsync(() =>
      getDb()
        .delete(notificationsInNotification)
        .where(
          and(
            inJsonArray(notificationsInNotification.userId, userIds),
            isNull(notificationsInNotification.deletedAt),
            lt(notificationsInNotification.createdAt, retentionCutoff),
          ),
        ),
    ).match(noop, (error) => {
      console.error("Failed to trim delivered notifications:", error);
    });
  }
  if (!channels.includes(NotificationChannel.Push)) return;
  // A subscription is per-session, so the session that caused the notification is excluded here rather than by
  // Dropping the recipient: the user's other devices are still owed the push
  // Also past the bell write, so a failed read answers with no subscriptions rather than with a redelivery
  const pushSubscriptions = await getResultAsync(() =>
    getPushSubscriptionsForUsers(getDb(), userIds, "excludedSessionId" in data ? data.excludedSessionId : undefined),
  )
    .orTee((error) => {
      console.error(`Failed to read push subscriptions for ${data.type}:`, error);
    })
    .unwrapOr([]);
  if (pushSubscriptions.length === 0) {
    console.log(`No push subscriptions for ${data.type}.`);
    return;
  }

  await sendWebPushNotifications(
    pushSubscriptions,
    getPushNotificationPayload({ body, icon, path, title, type: data.type }),
  );
};
