import type { Database, ModerationLogInMessage } from "@esposter/db-schema";

import { moderationLogsInMessage } from "@esposter/db-schema";

// Appends one row to the moderation audit log. Shared by the manual admin-action plugin, by automod, and by the
// Scheduled-delivery function, so every entry is written by this one insert
export const writeModerationLogEntry = async (
  db: Database,
  entry: Pick<ModerationLogInMessage, "actorUserId" | "durationMs" | "targetUserId" | "type"> & { roomId: string },
): Promise<void> => {
  // The row comes back, so the room's log readers, which watch the room's scope, are woken by it
  await db.insert(moderationLogsInMessage).values(entry).returning();
};
