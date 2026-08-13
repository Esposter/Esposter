import type { Context } from "@@/server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { THREAD_FOLLOW_CONFLICT_TARGET } from "@@/server/services/message/thread/constants";
import { threadFollowsInMessage } from "@esposter/db-schema";

// Records the member's decision to stop following, rather than deleting the row: a deleted row is
// Indistinguishable from one that never existed, and auto-follow reads that gap as "this member has not
// Decided yet". Written even where no follow row exists, so turning the bell off before ever being followed
// Still binds the next reply someone else posts to the thread
export const createThreadUnfollow = (
  db: Context["db"],
  { roomId, threadRootRowKey, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey" | "userId">,
) =>
  db
    .insert(threadFollowsInMessage)
    .values({ isUnfollowed: true, roomId, threadRootRowKey, userId })
    .onConflictDoUpdate({ set: { isUnfollowed: true }, target: THREAD_FOLLOW_CONFLICT_TARGET });
