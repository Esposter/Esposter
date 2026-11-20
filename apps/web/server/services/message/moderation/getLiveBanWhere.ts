import { bansInMessage } from "@esposter/db-schema";
import { and, eq, isNull } from "drizzle-orm";

// A ban is named by its room and the user it bans, and an unban keeps it as a tombstone, so only a live one matches
export const getLiveBanWhere = (roomId: string, userId: string) =>
  and(eq(bansInMessage.roomId, roomId), eq(bansInMessage.userId, userId), isNull(bansInMessage.deletedAt));
