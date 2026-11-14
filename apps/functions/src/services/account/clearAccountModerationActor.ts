import { db } from "#src/services/shared/db";
import { moderationLogsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

// The actions the account took as a moderator in rooms it does not own stay in each room's audit log, with the
// Moderator's id blanked, so the record outlives the account without naming the person. One update, served by the
// Actor index; a replay finds no rows left to blank and is done
export const clearAccountModerationActor = async (userId: string): Promise<void> => {
  await db
    .update(moderationLogsInMessage)
    .set({ actorUserId: null })
    .where(eq(moderationLogsInMessage.actorUserId, userId));
};
