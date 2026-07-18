import type { Context } from "@@/server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { threadFollowsInMessage } from "@esposter/db-schema";

// Idempotent follow — used by both the explicit follow procedure and auto-follow-on-reply.
export const createThreadFollow = (
  db: Context["db"],
  { roomId, threadRootRowKey, userId }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey" | "userId">,
) => db.insert(threadFollowsInMessage).values({ roomId, threadRootRowKey, userId }).onConflictDoNothing();
