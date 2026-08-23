import type { Database, ThreadFollowInMessage } from "@esposter/db-schema";

import { PUSH_SUBSCRIPTION_COLUMNS } from "#src/services/pushNotification/constants";
import {
  NotificationType,
  pushSubscriptionsInMessage,
  threadFollowsInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, ne, notInArray } from "drizzle-orm";

// Push subscriptions for everyone following a thread root, excluding the replier themself, anyone whose
// Room notification preference is Never, and anyone already reached by the generic message push
// (excludedUserIds) so a single reply never delivers two notifications to the same recipient.
// Mirrors getPushSubscriptionsForMessage's join shape.
export const getPushSubscriptionsForThreadFollowers = (
  db: Database,
  {
    excludedUserIds,
    roomId,
    senderUserId,
    threadRootRowKey,
  }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey"> & { excludedUserIds: string[]; senderUserId: string },
) => {
  const wheres = [
    // An unfollowed row records the member's decision to stop hearing about this thread, so it is not a follower
    eq(threadFollowsInMessage.isUnfollowed, false),
    eq(threadFollowsInMessage.roomId, roomId),
    eq(threadFollowsInMessage.threadRootRowKey, threadRootRowKey),
    ne(threadFollowsInMessage.userId, senderUserId),
    ne(usersToRoomsInMessage.notificationType, NotificationType.Never),
  ];
  if (excludedUserIds.length > 0) wheres.push(notInArray(threadFollowsInMessage.userId, excludedUserIds));
  return db
    .select({ ...PUSH_SUBSCRIPTION_COLUMNS })
    .from(threadFollowsInMessage)
    .innerJoin(pushSubscriptionsInMessage, eq(pushSubscriptionsInMessage.userId, threadFollowsInMessage.userId))
    .innerJoin(
      usersToRoomsInMessage,
      and(
        eq(usersToRoomsInMessage.userId, threadFollowsInMessage.userId),
        eq(usersToRoomsInMessage.roomId, threadFollowsInMessage.roomId),
      ),
    )
    .where(and(...wheres));
};
