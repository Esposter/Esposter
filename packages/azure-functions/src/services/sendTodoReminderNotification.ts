import type { InvocationContext } from "@azure/functions";

import { db } from "@/services/db";
import { getPushNotificationPayload } from "@/services/getPushNotificationPayload";
import { sendWebPushNotifications } from "@/services/sendWebPushNotifications";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { RoutePath } from "@esposter/shared";

export const sendTodoReminderNotification = async (
  context: InvocationContext,
  { itemName, resourceId, userId }: { itemName: string; resourceId: string; userId: string },
): Promise<void> => {
  const subscriptions = await getPushSubscriptionsForUser(db, userId);
  const payload = getPushNotificationPayload({
    body: `『${itemName}』 is due`,
    path: RoutePath.ResourceItems(resourceId),
    title: "Todo reminder",
  });
  await sendWebPushNotifications(context, subscriptions, payload);
};
