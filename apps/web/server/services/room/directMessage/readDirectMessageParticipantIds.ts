import type { Context } from "#server/trpc/context";

import { getLiveRowWhere, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const readDirectMessageParticipantIds = async (db: Context["db"], roomId: string) =>
  (
    await db
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), getLiveRowWhere(usersToRoomsInMessage)))
  ).map(({ userId }) => userId);
