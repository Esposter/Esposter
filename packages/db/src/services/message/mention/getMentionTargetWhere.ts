import type { Database, RoomMessage } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getMentionBadgeConditions } from "#src/services/message/mention/getMentionBadgeConditions";
import { getSenderClassifiedMentions } from "#src/services/message/mention/getSenderClassifiedMentions";
import { userStatusesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray, ne, or } from "drizzle-orm";

// The condition on a room's member rows that picks the members a message's mentions reach, the sender excluded. It is
// Undefined when the message reaches nobody, so a caller has no update to write
export const getMentionTargetWhere = async (
  db: Database,
  { message, roomId, userId }: Pick<RoomMessage, "message" | "userId"> & { roomId: string },
): Promise<SQL | undefined> => {
  const classifiedMentions = await getSenderClassifiedMentions(db, roomId, userId ?? undefined, message);
  const mentionCondition = or(...(await getMentionBadgeConditions(db, roomId, classifiedMentions)));
  if (!mentionCondition) return undefined;

  const mentionedUserIds = db
    .select({ userId: usersToRoomsInMessage.userId })
    .from(usersToRoomsInMessage)
    .leftJoin(userStatusesInMessage, eq(userStatusesInMessage.userId, usersToRoomsInMessage.userId))
    .where(and(eq(usersToRoomsInMessage.roomId, roomId), mentionCondition));
  return and(
    eq(usersToRoomsInMessage.roomId, roomId),
    inArray(usersToRoomsInMessage.userId, mentionedUserIds),
    userId ? ne(usersToRoomsInMessage.userId, userId) : undefined,
  );
};
