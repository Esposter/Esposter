import type { Context } from "@@/server/trpc/context";
import type { ThreadReplyNotificationEventGridData, User } from "@esposter/db-schema";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { getPushSubscriptionsForThreadFollowers } from "@esposter/db";
import { AzureFunction } from "@esposter/db-schema";

// Publishes a thread-reply push event to the room's thread followers. Best-effort — the caller runs it after
// the reply has already persisted, so a publish failure never fails the reply (mirrors the message push path).
export const notifyThreadReplyFollowers = async (
  db: Context["db"],
  message: { message: string; partitionKey: string; replyRowKey?: string; rowKey: string; userId: string },
  sender: Pick<User, "id" | "image" | "name">,
): Promise<void> => {
  if (!message.replyRowKey) return;
  const threadRootRowKey = message.replyRowKey;

  const readPushSubscriptions = await getPushSubscriptionsForThreadFollowers(db, {
    roomId: message.partitionKey,
    senderUserId: message.userId,
    threadRootRowKey,
  });
  if (readPushSubscriptions.length === 0) return;

  const nickname = (
    await db.query.usersToRoomsInMessage.findFirst({
      columns: { nickname: true },
      where: { roomId: message.partitionKey, userId: sender.id },
    })
  )?.nickname;
  const data: ThreadReplyNotificationEventGridData = {
    message: {
      message: message.message,
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
      userId: message.userId,
    },
    notificationOptions: { icon: sender.image, title: nickname || sender.name },
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
