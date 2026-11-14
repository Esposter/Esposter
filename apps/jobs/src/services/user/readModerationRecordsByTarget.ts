import type { Database, UserInAuth } from "@esposter/db-schema";

import { moderationLogsInMessage, moderationNotesInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The moderation log entries and notes that name the person as their target, across every room they were in.
// A record in a room the person has left is one the archive keeps.
export const readModerationRecordsByTarget = async (db: Database, targetUserId: UserInAuth["id"]) => {
  const [logs, notes] = await Promise.all([
    db
      .select({
        actorUserId: moderationLogsInMessage.actorUserId,
        createdAt: moderationLogsInMessage.createdAt,
        durationMs: moderationLogsInMessage.durationMs,
        roomId: moderationLogsInMessage.roomId,
        targetUserId: moderationLogsInMessage.targetUserId,
        type: moderationLogsInMessage.type,
      })
      .from(moderationLogsInMessage)
      .where(eq(moderationLogsInMessage.targetUserId, targetUserId)),
    db
      .select({
        actorUserId: moderationNotesInMessage.actorUserId,
        createdAt: moderationNotesInMessage.createdAt,
        note: moderationNotesInMessage.note,
        roomId: moderationNotesInMessage.roomId,
        targetUserId: moderationNotesInMessage.targetUserId,
      })
      .from(moderationNotesInMessage)
      .where(eq(moderationNotesInMessage.targetUserId, targetUserId)),
  ]);
  return { logs, notes };
};
