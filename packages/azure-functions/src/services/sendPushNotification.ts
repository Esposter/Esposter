import type { InvocationContext } from "@azure/functions";
import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { db } from "@/services/db";
import { getCreateMessageNotificationPayload } from "@/services/getCreateMessageNotificationPayload";
import { sendWebPushNotifications } from "@/services/sendWebPushNotifications";
import { getPushSubscriptionsForMessage } from "@esposter/db";
import { RoutePath } from "@esposter/shared";

export const sendPushNotification = async (
  context: InvocationContext,
  {
    message: { message, partitionKey, rowKey, userId },
    notificationOptions: { icon, title },
  }: PushNotificationEventGridData,
): Promise<void> => {
  const payload = getCreateMessageNotificationPayload(context, message, {
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

  await sendWebPushNotifications(context, readPushSubscriptions, payload);
};
