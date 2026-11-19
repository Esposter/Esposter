import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { upsertThreadFollow } from "#src/services/message/thread/upsertThreadFollow";
import { threadFollowsInMessage } from "@esposter/db-schema";

// Idempotent follow. `isSelfInitiated` says whose action this is, which is the only thing that decides whether
// It may clear an existing unfollow: the bell and the member's own reply are their own decision and undo an
// Earlier one, while the follow taken on the thread root author's behalf when somebody else replies is not —
// Resurrecting their row there re-subscribes a member who turned the bell off, with no way to make it stick
// The return type is spelled for the reason `upsertThreadFollow`'s is
export const createThreadFollow = (
  db: Database,
  { roomId, threadRootId, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootId" | "userId">,
  isSelfInitiated: boolean,
): PromiseLike<unknown> =>
  isSelfInitiated
    ? upsertThreadFollow(db, { roomId, threadRootId, userId }, false)
    : db.insert(threadFollowsInMessage).values({ roomId, threadRootId, userId }).onConflictDoNothing();
