import type { Context } from "@@/server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { MAX_FOLLOWED_THREADS } from "@esposter/db-schema";

// Follow-STATE source of truth: every follow row's root rowKey for a room, unfiltered by whether the root
// Message still exists. readFollowedThreads drops deleted roots for the drawer, but the DB follow row (and
// Its notifications) outlive the root, so follow-state must read this instead — otherwise a followed thread
// Whose root was deleted looks unfollowed and can never be unfollowed.
export const readFollowedThreadRootRowKeys = async (
  db: Context["db"],
  roomId: string,
  userId: string,
): Promise<ThreadFollowInMessage["threadRootRowKey"][]> => {
  const follows = await db.query.threadFollowsInMessage.findMany({
    columns: { threadRootRowKey: true },
    limit: MAX_FOLLOWED_THREADS,
    orderBy: { createdAt: "desc" },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
  return follows.map(({ threadRootRowKey }) => threadRootRowKey);
};
