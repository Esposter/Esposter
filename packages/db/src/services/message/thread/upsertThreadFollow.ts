import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { THREAD_FOLLOW_CONFLICT_TARGET } from "#src/services/message/thread/constants";
import { threadFollowsInMessage } from "@esposter/db-schema";

// The upsert a follow and an unfollow share: an existing row takes the decision, a missing one is inserted with it
// The return type is spelled because the inferred one names zod's `$brand` through `@esposter/azure`'s link to the
// Same zod, which `tsrs` cannot write an import for and reports as TS2883
export const upsertThreadFollow = (
  db: Database,
  { roomId, threadRootRowKey, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey" | "userId">,
  isUnfollowed: boolean,
): PromiseLike<unknown> =>
  db
    .insert(threadFollowsInMessage)
    .values({ isUnfollowed, roomId, threadRootRowKey, userId })
    .onConflictDoUpdate({ set: { isUnfollowed }, target: THREAD_FOLLOW_CONFLICT_TARGET });
