import type { InvocationContext } from "@azure/functions";

import { db } from "@/services/db";
import { PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH } from "@/services/constants";
import { webpush } from "@/services/webpush";
import { getPushSubscriptionsForUser } from "@esposter/db";
import { pushSubscriptionsInMessage } from "@esposter/db-schema";
import { getResultAsync, noop, RoutePath, truncate } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { WebPushError } from "web-push";

export const sendReminderNotification = async (
  context: InvocationContext,
  { roomId, text, userId }: { roomId: string; text: string; userId: string },
): Promise<void> => {
  const subscriptions = await getPushSubscriptionsForUser(db, userId);
  await Promise.all(
    subscriptions.map(({ auth, endpoint, expirationTime, id, p256dh }) =>
      getResultAsync(() =>
        webpush.sendNotification(
          { endpoint, expirationTime: expirationTime ? expirationTime.getTime() : null, keys: { auth, p256dh } },
          JSON.stringify({
            body: truncate(text, PUSH_NOTIFICATION_MESSAGE_MAX_LENGTH),
            data: { url: `${process.env.BASE_URL}${RoutePath.Messages(roomId)}` },
            title: "Reminder",
          }),
        ),
      ).match(noop, async (error) => {
        if (error instanceof WebPushError && error.statusCode === 410)
          await db.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.id, id));
        else context.error(`Failed to send reminder notification to ${endpoint}: `, error);
      }),
    ),
  );
};
