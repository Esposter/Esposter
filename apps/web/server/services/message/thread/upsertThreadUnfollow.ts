import type { Context } from "#server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { upsertThreadFollow } from "@esposter/db";

// Records the member's decision to stop following, rather than deleting the row: a deleted row is
// Indistinguishable from one that never existed, and auto-follow reads that gap as "this member has not
// Decided yet". Written even where no follow row exists, so turning the bell off before ever being followed
// Still binds the next reply someone else posts to the thread
export const upsertThreadUnfollow = (
  db: Context["db"],
  { roomId, threadRootRowKey, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey" | "userId">,
) => upsertThreadFollow(db, { roomId, threadRootRowKey, userId }, true);
