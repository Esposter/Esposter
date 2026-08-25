import type { AzureTable, AzureTableEntityMap, CustomTableClient, Database, MessageEntity } from "@esposter/db-schema";

import { getEntity } from "#src/services/azure/table/getEntity";
import { createThreadFollow } from "#src/services/message/thread/createThreadFollow";
import { StandardMessageEntity } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// A reply auto-follows its thread (Discord behaviour), for whoever wrote it and for the root's author alike.
// Every path that creates a reply owes this, and owes it strictly BEFORE it publishes: the follow rows are what
// ProcessNotification reads to decide who the reply reaches, so a publish that overtakes them notifies a
// Follower set one reply out of date.
export const createReplyThreadFollows = async (
  db: Database,
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  { partitionKey, replyRowKey, userId }: Pick<MessageEntity, "partitionKey" | "replyRowKey" | "userId">,
): Promise<void> => {
  if (!(replyRowKey && userId)) return;
  // The root's author is followed alongside the replier: Discord tells you when someone replies to your
  // Message, and following only repliers leaves the one member the thread belongs to as the only one the
  // Pipeline never reaches — while anyone who merely replied once keeps being told
  const threadRootMessage = await getResultAsync(() =>
    getEntity(messageClient, StandardMessageEntity, partitionKey, replyRowKey),
  )
    .orTee(console.error)
    .unwrapOr(null);
  // The replier's own send is their own decision, so it undoes an unfollow they made earlier
  const threadFollows = [createThreadFollow(db, { roomId: partitionKey, threadRootRowKey: replyRowKey, userId }, true)];
  // Guarded on the author existing, not merely on the root being read: a webhook root has no author at all
  // (`WebhookMessageEntity` declares `userId?: undefined`) and the follow row's `userId` is NOT NULL, so an
  // Unguarded push turns every reply to a webhook message into a constraint violation. The root's author did
  // Not do this — somebody else replied — so their follow is only ever created, never restored: an author who
  // Turned the bell off on their own thread stays off it
  if (threadRootMessage?.userId && threadRootMessage.userId !== userId)
    threadFollows.push(
      createThreadFollow(
        db,
        { roomId: partitionKey, threadRootRowKey: replyRowKey, userId: threadRootMessage.userId },
        false,
      ),
    );
  await Promise.all(threadFollows);
};
