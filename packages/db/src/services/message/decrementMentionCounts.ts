import type { Database, RoomMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { getMentionTargetWhere } from "#src/services/message/mention/getMentionTargetWhere";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { and, isNull, lt, lte, ne, or, sql } from "drizzle-orm";

// Takes back the count a message made for each member it mentioned, when the message is deleted or edited away from the
// Mention. The text's counts were made when it was last written — its edit, or else its send — and a count is held only by
// A member who was in the room by then and has not read the room since, since a read clears the counts it stands on. So
// Only those members are reached: a count a later message made is never taken, and a member who joined after the text was
// Written was never counted for it.
// A count at zero is skipped, so no count goes below zero
export const decrementMentionCounts = async (
  db: Database,
  {
    createdAt,
    editedAt,
    message,
    roomId,
    userId,
  }: Pick<RoomMessage, "createdAt" | "editedAt" | "message" | "userId"> & { roomId: string },
): Promise<UserToRoomInMessage[]> => {
  const writtenAt = editedAt ?? createdAt;
  const mentionTargetWhere = await getMentionTargetWhere(db, { message, roomId, userId });
  if (!mentionTargetWhere) return [];

  return db
    .update(usersToRoomsInMessage)
    .set({ mentionCount: sql`${usersToRoomsInMessage.mentionCount} - 1` })
    .where(
      and(
        mentionTargetWhere,
        ne(usersToRoomsInMessage.mentionCount, 0),
        lte(usersToRoomsInMessage.createdAt, writtenAt),
        or(isNull(usersToRoomsInMessage.lastReadAt), lt(usersToRoomsInMessage.lastReadAt, writtenAt)),
      ),
    )
    .returning();
};
