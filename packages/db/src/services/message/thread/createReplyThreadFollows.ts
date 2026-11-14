import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { createThreadFollow } from "#src/services/message/thread/createThreadFollow";

// A reply auto-follows its thread (Discord behaviour), for whoever wrote it and for the root's author alike.
// Every path that creates a reply owes this, and owes it strictly BEFORE it publishes: the follow rows are what
// ProcessNotification reads to decide who the reply reaches, so a publish that overtakes them notifies a
// Follower set one reply out of date. The caller reads the root's author from the room that holds the root, since
// The root is not in this database
export const createReplyThreadFollows = async (
  db: Database,
  {
    roomId,
    threadRootId,
    threadRootUserId,
    userId,
  }: Pick<ThreadFollowInMessage, "roomId" | "threadRootId"> & { threadRootUserId?: string; userId?: string },
): Promise<void> => {
  if (threadRootId === null || !userId) return;
  // The root's author is followed alongside the replier: Discord tells you when someone replies to your
  // Message, and following only repliers leaves the one member the thread belongs to as the only one the
  // Pipeline never reaches — while anyone who merely replied once keeps being told
  // The replier's own send is their own decision, so it undoes an unfollow they made earlier
  const threadFollows = [createThreadFollow(db, { roomId, threadRootId, userId }, true)];
  // Guarded on the author existing, not merely on the root being read: a webhook root has no author at all and the
  // Follow row's `userId` is NOT NULL, so an unguarded push turns every reply to a webhook message into a constraint
  // Violation. The root's author did not do this — somebody else replied — so their follow is only ever created, never
  // Restored: an author who turned the bell off on their own thread stays off it
  if (threadRootUserId && threadRootUserId !== userId)
    threadFollows.push(createThreadFollow(db, { roomId, threadRootId, userId: threadRootUserId }, false));
  await Promise.all(threadFollows);
};
