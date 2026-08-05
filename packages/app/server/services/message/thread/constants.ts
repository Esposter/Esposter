import { threadFollowsInMessage } from "@esposter/db-schema";

// The follow row's own primary key, named once so the follow and the unfollow upsert cannot target different
// Columns and silently stop conflicting with each other's rows
export const THREAD_FOLLOW_CONFLICT_TARGET = [
  threadFollowsInMessage.userId,
  threadFollowsInMessage.roomId,
  threadFollowsInMessage.threadRootRowKey,
];
