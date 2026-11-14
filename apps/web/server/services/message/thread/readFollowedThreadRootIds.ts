import type { Context } from "#server/trpc/context";
import type { ThreadFollowInMessage } from "@esposter/db-schema";

import { MAX_FOLLOWED_THREADS } from "@esposter/db-schema";

// Follow-STATE source of truth: every follow row's root id for a room, unfiltered by whether the root message still
// exists. readFollowedThreads drops deleted roots for the drawer, but the DB follow row (and its notifications) outlive
// the root, so follow-state must read this instead — otherwise a followed thread whose root was deleted looks unfollowed
// and can never be unfollowed. Unfollowed rows are the member's recorded decision to stop, not a follow, so they never
// appear here
export const readFollowedThreadRootIds = async (
  db: Context["db"],
  roomId: string,
  userId: string,
): Promise<ThreadFollowInMessage["threadRootId"][]> => {
  const follows = await db.query.threadFollowsInMessage.findMany({
    columns: { threadRootId: true },
    limit: MAX_FOLLOWED_THREADS,
    orderBy: { createdAt: "desc" },
    where: { isUnfollowed: { eq: false }, roomId: { eq: roomId }, userId: { eq: userId } },
  });
  return follows.map(({ threadRootId }) => threadRootId);
};
