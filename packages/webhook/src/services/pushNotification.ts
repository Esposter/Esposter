import type { MessageEntity } from "@esposter/db-schema";

import { db } from "@/services/db";
import { pushSubscriptions, usersToRooms } from "@esposter/db-schema";
import { getCreateMessageNotificationPayload, RoutePath } from "@esposter/shared";
import { and, eq } from "drizzle-orm";
import webpush from "web-push";

export const pushNotification = async ({ message, partitionKey, rowKey }: MessageEntity): Promise<void> => {
  const payload = getCreateMessageNotificationPayload(message, {
    url: `${process.env.BASE_URL}${RoutePath.MessagesMessage(partitionKey, rowKey)}`,
  });
  if (!payload) return;

  const rows = await db
    .select({
      auth: pushSubscriptions.auth,
      endpoint: pushSubscriptions.endpoint,
      expirationTime: pushSubscriptions.expirationTime,
      p256dh: pushSubscriptions.p256dh,
    })
    .from(pushSubscriptions)
    .innerJoin(
      usersToRooms,
      and(eq(usersToRooms.userId, pushSubscriptions.userId), eq(usersToRooms.roomId, partitionKey)),
    );
  await Promise.all(
    rows.map(({ auth, endpoint, expirationTime, p256dh }) =>
      webpush.sendNotification(
        { endpoint, expirationTime: expirationTime ? expirationTime.getTime() : null, keys: { auth, p256dh } },
        payload,
      ),
    ),
  );
};
