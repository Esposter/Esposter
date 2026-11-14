import type { Context } from "#server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { upsertThreadFollow } from "@esposter/db";

// Records the member's decision to stop following, rather than deleting the row: a deleted row is indistinguishable from
// one that never existed, and auto-follow reads that gap as "this member has not decided yet". Written even where no
// follow row exists, so turning the bell off before ever being followed still binds the next reply someone else posts
export const upsertThreadUnfollow = (
  db: Context["db"],
  { roomId, threadRootId, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootId" | "userId">,
) => upsertThreadFollow(db, { roomId, threadRootId, userId }, true);
