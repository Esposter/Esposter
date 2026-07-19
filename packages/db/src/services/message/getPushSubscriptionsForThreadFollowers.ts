import type { relations, ThreadFollowInMessage } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { PUSH_SUBSCRIPTION_COLUMNS } from "@/services/pushNotification/constants";
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
  db: PostgresJsDatabase<typeof relations>,
  {
    excludedUserIds,
    roomId,
    senderUserId,
    threadRootRowKey,
  }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey"> & { excludedUserIds: string[]; senderUserId: string },
) => {
  const wheres = [
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
