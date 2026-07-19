import type { Context } from "@@/server/trpc/context";
import type { NotificationOptions, ThreadReplyNotificationEventGridData } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { getPushSubscriptionsForThreadFollowers } from "@esposter/db";
import { AzureFunction } from "@esposter/db-schema";

// Publishes a thread-reply push event to the room's thread followers, excluding anyone the caller already
// Reached via the generic message push (excludedUserIds) so no recipient is notified twice for one reply.
// Best-effort — the caller runs it after the reply has already persisted, so a publish failure never fails
// The reply (mirrors the message push path). The sender's resolved title/icon are passed in so we never
// Re-query the nickname the caller already looked up.
export const notifyThreadReplyFollowers = async (
  db: Context["db"],
  message: { message: string; partitionKey: string; replyRowKey?: string; rowKey: string; userId: string },
  notificationOptions: NotificationOptions,
  excludedUserIds: string[],
): Promise<void> => {
  if (!message.replyRowKey) return;
  const threadRootRowKey = message.replyRowKey;

  const readPushSubscriptions = await getPushSubscriptionsForThreadFollowers(db, {
    excludedUserIds,
    roomId: message.partitionKey,
    senderUserId: message.userId,
    threadRootRowKey,
  });
  if (readPushSubscriptions.length === 0) return;

  const data: ThreadReplyNotificationEventGridData = {
    message: {
      message: message.message,
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
      userId: message.userId,
    },
    notificationOptions,
    threadRootRowKey,
  };
  await useEventGridPublisherClient().send([
    {
      data,
      dataVersion: "1.0",
      eventType: AzureFunction.ProcessThreadReplyNotification,
      subject: `${message.partitionKey}/${message.rowKey}`,
    },
  ]);
};
