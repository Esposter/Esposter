import type { Context } from "#server/trpc/context";
import type { RoomInMessage, UserInAuth } from "@esposter/db-schema";

import { moderationNotesInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { and, count, eq } from "drizzle-orm";

// The notes badge needs a true total, which the paginated read cannot give since it returns only the loaded page
export const readModerationNotesCount = async (
  db: Context["db"],
  roomId: RoomInMessage["id"],
  targetUserId: UserInAuth["id"],
): Promise<number> =>
  takeOne(
    await db
      .select({ count: count() })
      .from(moderationNotesInMessage)
      .where(and(eq(moderationNotesInMessage.roomId, roomId), eq(moderationNotesInMessage.targetUserId, targetUserId))),
  ).count;
