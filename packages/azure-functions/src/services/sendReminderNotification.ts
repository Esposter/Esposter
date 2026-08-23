import type { InvocationContext } from "@azure/functions";

import { db } from "#src/services/db";
import { getPushNotificationPayload } from "#src/services/getPushNotificationPayload";
import { sendWebPushNotifications } from "#src/services/sendWebPushNotifications";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { RoutePath } from "@esposter/shared";

export const sendReminderNotification = async (
  context: InvocationContext,
  { roomId, text, userId }: { roomId: string; text: string; userId: string },
): Promise<void> => {
  const subscriptions = await getPushSubscriptionsForUser(db, userId);
  const payload = getPushNotificationPayload({ body: text, path: RoutePath.Messages(roomId), title: "Reminder" });
  await sendWebPushNotifications(context, subscriptions, payload);
};
