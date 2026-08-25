import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { NotificationType, threadFollowsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";

// Everyone following a thread root, excluding the replier themself and anyone whose room notification preference
// Is Never. No exclusion list beyond that: the caller unions this with the room's own recipients, so a follower
// The room already notifies is deduplicated by the set rather than subtracted by the query.
export const getThreadFollowerUserIds = async (
  db: Database,
  {
    roomId,
    senderUserId,
    threadRootRowKey,
  }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey"> & { senderUserId?: string },
): Promise<string[]> => {
  const wheres = [
    // An unfollowed row records the member's decision to stop hearing about this thread, so it is not a follower
    eq(threadFollowsInMessage.isUnfollowed, false),
    eq(threadFollowsInMessage.roomId, roomId),
    eq(threadFollowsInMessage.threadRootRowKey, threadRootRowKey),
    ne(usersToRoomsInMessage.notificationType, NotificationType.Never),
  ];
  if (senderUserId) wheres.push(ne(threadFollowsInMessage.userId, senderUserId));
  const followers = await db
    .selectDistinct({ userId: threadFollowsInMessage.userId })
    .from(threadFollowsInMessage)
    .innerJoin(
      usersToRoomsInMessage,
      and(
        eq(usersToRoomsInMessage.userId, threadFollowsInMessage.userId),
        eq(usersToRoomsInMessage.roomId, threadFollowsInMessage.roomId),
      ),
    )
    .where(and(...wheres));
  return followers.map((follower) => follower.userId);
};
