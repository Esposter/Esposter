import type { InvocationContext } from "@azure/functions";

import { db } from "@/services/db";
import { sendWebPushNotifications } from "@/services/sendWebPushNotifications";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@esposter/db-schema";
import { RoutePath, truncate } from "@esposter/shared";

export const sendReminderNotification = async (
  context: InvocationContext,
  { roomId, text, userId }: { roomId: string; text: string; userId: string },
): Promise<void> => {
  const subscriptions = await getPushSubscriptionsForUser(db, userId);
  const payload = JSON.stringify({
    body: truncate(text, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
    data: { url: `${process.env.BASE_URL}${RoutePath.Messages(roomId)}` },
    title: "Reminder",
  });
  await sendWebPushNotifications(context, subscriptions, payload);
};
