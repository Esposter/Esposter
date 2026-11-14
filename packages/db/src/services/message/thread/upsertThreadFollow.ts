import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { THREAD_FOLLOW_CONFLICT_TARGET } from "#src/services/message/thread/constants";
import { threadFollowsInMessage } from "@esposter/db-schema";

// The upsert a follow and an unfollow share: an existing row takes the decision, a missing one is inserted with it
// The return type is spelled because the inferred one names zod's `$brand`, which this package cannot reach
// Left inferred, the declaration fails with TS2883 (microsoft/TypeScript#64599)
export const upsertThreadFollow = (
  db: Database,
  { roomId, threadRootId, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootId" | "userId">,
  isUnfollowed: boolean,
): PromiseLike<unknown> =>
  db
    .insert(threadFollowsInMessage)
    .values({ isUnfollowed, roomId, threadRootId, userId })
    .onConflictDoUpdate({ set: { isUnfollowed }, target: THREAD_FOLLOW_CONFLICT_TARGET });
