import type { Context } from "@@/server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { THREAD_FOLLOW_CONFLICT_TARGET } from "@@/server/services/message/thread/constants";
import { threadFollowsInMessage } from "@esposter/db-schema";

// Idempotent follow. `isSelfInitiated` says whose action this is, which is the only thing that decides whether
// It may clear an existing unfollow: the bell and the member's own reply are their own decision and undo an
// Earlier one, while the follow taken on the thread root author's behalf when somebody else replies is not —
// Resurrecting their row there re-subscribes a member who turned the bell off, with no way to make it stick
export const createThreadFollow = (
  db: Context["db"],
  { roomId, threadRootRowKey, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey" | "userId">,
  isSelfInitiated: boolean,
) => {
  const insert = db.insert(threadFollowsInMessage).values({ roomId, threadRootRowKey, userId });
  return isSelfInitiated
    ? insert.onConflictDoUpdate({ set: { isUnfollowed: false }, target: THREAD_FOLLOW_CONFLICT_TARGET })
    : insert.onConflictDoNothing();
};
