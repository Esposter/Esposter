import type { Database, RoomMessage, UserToRoomInMessage } from "@esposter/db-schema";

import { getMentionTargetWhere } from "#src/services/message/mention/getMentionTargetWhere";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// Bumps the per-user mention counter for every member targeted by the message's mentions in a
// Single batched UPDATE (the userStatuses join for @here lives in the inArray subquery), excluding
// The sender, and returns the updated rows so callers can fan them out to their user objects.
export const incrementMentionCounts = async (
  db: Database,
  { message, roomId, userId }: Pick<RoomMessage, "message" | "userId"> & { roomId: string },
): Promise<UserToRoomInMessage[]> => {
  const mentionTargetWhere = await getMentionTargetWhere(db, { message, roomId, userId });
  if (!mentionTargetWhere) return [];

  return db
    .update(usersToRoomsInMessage)
    .set({ mentionCount: sql`${usersToRoomsInMessage.mentionCount} + 1` })
    .where(mentionTargetWhere)
    .returning();
};
