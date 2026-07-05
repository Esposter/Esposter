import type { InvocationContext } from "@azure/functions";
import type { FriendRequestNotificationEventGridData } from "@esposter/db-schema";

import { db } from "@/services/db";
import { sendWebPushNotifications } from "@/services/sendWebPushNotifications";
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

  const payload = JSON.stringify({
    body: "sent you a friend request",
    data: { url: `${process.env.BASE_URL}${RoutePath.MessagesFriends}` },
    icon,
    title,
  });
  await sendWebPushNotifications(context, readPushSubscriptions, payload);
};
