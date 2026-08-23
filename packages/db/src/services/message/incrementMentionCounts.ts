import type { Database, MessageEntity, UserToRoomInMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getMentionBadgeConditions } from "#src/services/message/mention/getMentionBadgeConditions";
import { userStatusesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { classifyMentions } from "@esposter/shared";
import { and, eq, inArray, ne, or, sql } from "drizzle-orm";

// Bumps the per-user mention counter for every member targeted by the message's mentions in a
// Single batched UPDATE (the userStatuses join for @here lives in the inArray subquery), excluding
// The sender, and returns the updated rows so callers can fan them out to subscriptions.
export const incrementMentionCounts = async (
  db: Database,
  { message, partitionKey, userId }: Pick<MessageEntity, "message" | "partitionKey" | "userId">,
): Promise<UserToRoomInMessage[]> => {
  const classifiedMentions = classifyMentions(message);
  const mentionCondition = or(...(await getMentionBadgeConditions(db, partitionKey, classifiedMentions)));
  if (!mentionCondition) return [];

  const mentionedUserIds = db
    .select({ userId: usersToRoomsInMessage.userId })
    .from(usersToRoomsInMessage)
    .leftJoin(userStatusesInMessage, eq(userStatusesInMessage.userId, usersToRoomsInMessage.userId))
    .where(and(eq(usersToRoomsInMessage.roomId, partitionKey), mentionCondition));
  const andWheres: (SQL | undefined)[] = [
    eq(usersToRoomsInMessage.roomId, partitionKey),
    inArray(usersToRoomsInMessage.userId, mentionedUserIds),
  ];
  if (userId) andWheres.push(ne(usersToRoomsInMessage.userId, userId));
  return db
    .update(usersToRoomsInMessage)
    .set({ mentionCount: sql`${usersToRoomsInMessage.mentionCount} + 1` })
    .where(and(...andWheres))
    .returning();
};
