import type { InvocationContext } from "@azure/functions";
import type { NotificationEventGridData } from "@esposter/db-schema";

import { db } from "#src/services/db";
import { getPushNotificationPayload } from "#src/services/notification/getPushNotificationPayload";
import { resolveNotification } from "#src/services/notification/resolveNotification";
import { sendWebPushNotifications } from "#src/services/notification/sendWebPushNotifications";
import { getPushSubscriptionsForUsers } from "@esposter/db";
import {
  NOTIFICATION_RETENTION_MS,
  NotificationChannel,
  NotificationChannelMap,
  notifications,
  NotificationSeverityMap,
} from "@esposter/db-schema";
import { and, inArray, lt } from "drizzle-orm";

// The whole fan-out, and the only place that decides where a notification lands. Recipient resolution is the one
// Thing that varies by type; everything past it reads the type's declared channels, so adding a notification is
// Adding a resolver case and a map entry rather than a Function, a subscription and a delivery path.
export const sendNotification = async (context: InvocationContext, data: NotificationEventGridData): Promise<void> => {
  const resolvedNotification = await resolveNotification(context, data);
  if (!resolvedNotification) {
    context.log(`Nothing to notify for ${data.type}.`);
    return;
  }

  const { body, icon, path, title, userIds } = resolvedNotification;
  if (userIds.length === 0) {
    context.log(`No recipients for ${data.type}.`);
    return;
  }

  const severity = NotificationSeverityMap[data.type];
  const channels = NotificationChannelMap[data.type];
  if (channels.includes(NotificationChannel.Bell)) {
    // One statement for every recipient: the bell is a row per user, and a notification with a hundred recipients
    // Is still one round trip
    await db
      .insert(notifications)
      .values(userIds.map((userId) => ({ body, path, severity, title, type: data.type, userId })));
    // The retention trim rides the write rather than a sweep of its own: the recipients are already known here,
    // So bounding the table costs one indexed delete against the rows that were just added to
    await db
      .delete(notifications)
      .where(
        and(
          inArray(notifications.userId, userIds),
          lt(notifications.createdAt, new Date(Date.now() - NOTIFICATION_RETENTION_MS)),
        ),
      );
  }
  if (!channels.includes(NotificationChannel.Push)) return;
  // A subscription is per-session, so the session that caused the notification is excluded here rather than by
  // Dropping the recipient: the user's other devices are still owed the push
  const pushSubscriptions = await getPushSubscriptionsForUsers(
    db,
    userIds,
    "excludedSessionId" in data ? data.excludedSessionId : undefined,
  );
  if (pushSubscriptions.length === 0) {
    context.log(`No push subscriptions for ${data.type}.`);
    return;
  }

  await sendWebPushNotifications(
    context,
    pushSubscriptions,
    getPushNotificationPayload({ body, icon, path, severity, title, type: data.type }),
  );
};
