import type { relations, ThreadFollowInMessage } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { PUSH_SUBSCRIPTION_COLUMNS } from "@/services/pushNotification/constants";
import {
  NotificationType,
  pushSubscriptionsInMessage,
  threadFollowsInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";

// Push subscriptions for everyone following a thread root, excluding the replier themself and anyone whose
// Room notification preference is Never. Mirrors getPushSubscriptionsForMessage's join shape.
export const getPushSubscriptionsForThreadFollowers = (
  db: PostgresJsDatabase<typeof relations>,
  {
    roomId,
    senderUserId,
    threadRootRowKey,
  }: Pick<ThreadFollowInMessage, "roomId" | "threadRootRowKey"> & { senderUserId: string },
) =>
  db
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
    .where(
      and(
        eq(threadFollowsInMessage.roomId, roomId),
        eq(threadFollowsInMessage.threadRootRowKey, threadRootRowKey),
        ne(threadFollowsInMessage.userId, senderUserId),
        ne(usersToRoomsInMessage.notificationType, NotificationType.Never),
      ),
    );
