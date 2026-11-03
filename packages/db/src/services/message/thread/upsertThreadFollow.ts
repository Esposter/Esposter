import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { THREAD_FOLLOW_CONFLICT_TARGET } from "#src/services/message/thread/constants";
import { threadFollowsInMessage } from "@esposter/db-schema";

// The upsert a follow and an unfollow share: an existing row takes the decision, a missing one is inserted with it
// The return type is spelled because the inferred one names zod's `$brand`, which this package cannot reach: TypeScript
// 7.0 wrote an `import("zod")` it cannot resolve, and 7.1 reports TS2883 instead (microsoft/TypeScript#64599)
export const upsertThreadFollow = (
  db: Database,
  { roomId, threadRootRowKey, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey" | "userId">,
  isUnfollowed: boolean,
): PromiseLike<unknown> =>
  db
    .insert(threadFollowsInMessage)
    .values({ isUnfollowed, roomId, threadRootRowKey, userId })
    .onConflictDoUpdate({ set: { isUnfollowed }, target: THREAD_FOLLOW_CONFLICT_TARGET });
