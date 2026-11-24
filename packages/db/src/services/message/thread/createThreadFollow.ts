import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { upsertThreadFollow } from "#src/services/message/thread/upsertThreadFollow";
import { threadFollowsInMessage } from "@esposter/db-schema";

// Idempotent follow.
// `isSelfInitiated` says whose action this is, and only that decides whether it may clear an existing unfollow.
// The bell and the member's own reply are their own decision, and undo an earlier unfollow.
// The follow taken for the thread root author when somebody else replies is not their own decision.
// Resurrecting their row there re-subscribes a member who turned the bell off, with no way to make it stick.
// The return type is spelled for the reason `upsertThreadFollow`'s is.
// A follow that finds its row already held returns none.
export const createThreadFollow = (
  db: Database,
  { roomId, threadRootId, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootId" | "userId">,
  isSelfInitiated: boolean,
): PromiseLike<ThreadFollowInMessage[]> =>
  isSelfInitiated
    ? upsertThreadFollow(db, { roomId, threadRootId, userId }, false)
    : db.insert(threadFollowsInMessage).values({ roomId, threadRootId, userId }).onConflictDoNothing().returning();
