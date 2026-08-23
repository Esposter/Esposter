import type { InvocationContext } from "@azure/functions";
import type { FriendRequestNotificationEventGridData } from "@esposter/db-schema";

import { db } from "#src/services/db";
import { getPushNotificationPayload } from "#src/services/getPushNotificationPayload";
import { sendWebPushNotifications } from "#src/services/sendWebPushNotifications";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { RoutePath } from "@esposter/shared";

export const sendFriendRequestNotification = async (
  context: InvocationContext,
  { notificationOptions: { icon, title }, receiverId }: FriendRequestNotificationEventGridData,
): Promise<void> => {
  const readPushSubscriptions = await getPushSubscriptionsForUser(db, receiverId);
  if (readPushSubscriptions.length === 0) {
    context.log(`No push subscriptions found for user ${receiverId}.`);
    return;
  }

  const payload = getPushNotificationPayload({
    body: "sent you a friend request",
    icon,
    path: RoutePath.MessagesFriends,
    title,
  });
  await sendWebPushNotifications(context, readPushSubscriptions, payload);
};
