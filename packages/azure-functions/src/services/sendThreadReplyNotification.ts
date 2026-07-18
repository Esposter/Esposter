import type { InvocationContext } from "@azure/functions";
import type { ThreadReplyNotificationEventGridData } from "@esposter/db-schema";

import { db } from "@/services/db";
import { getCreateMessageNotificationPayload } from "@/services/getCreateMessageNotificationPayload";
import { sendWebPushNotifications } from "@/services/sendWebPushNotifications";
import { getPushSubscriptionsForThreadFollowers } from "@esposter/db";
import { RoutePath } from "@esposter/shared";

export const sendThreadReplyNotification = async (
  context: InvocationContext,
  {
    message: { message, partitionKey, userId },
    notificationOptions: { icon, title },
    threadRootRowKey,
  }: ThreadReplyNotificationEventGridData,
): Promise<void> => {
  const payload = getCreateMessageNotificationPayload(context, message, {
    icon,
    title,
    // Deep-link to the thread root so the notification opens the thread it belongs to.
    url: `${process.env.BASE_URL}${RoutePath.MessagesMessage(partitionKey, threadRootRowKey)}`,
  });
  if (!payload) return;

  const readPushSubscriptions = await getPushSubscriptionsForThreadFollowers(db, {
    roomId: partitionKey,
    senderUserId: userId,
    threadRootRowKey,
  });
  if (readPushSubscriptions.length === 0) {
    context.log(`No thread followers with push subscriptions for room ${partitionKey}.`);
    return;
  }

  await sendWebPushNotifications(context, readPushSubscriptions, payload);
};
