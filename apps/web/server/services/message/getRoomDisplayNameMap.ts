import type { Context } from "#server/trpc/context";

import { getDisplayNameExpression, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

// The room display name of each user id, for rows that carry a bare user id and no membership of their own.
// Such rows are an audit actor or a moderation note's author.
// A user without a membership in the room falls back to the account name.
export const getRoomDisplayNameMap = async (db: Context["db"], roomId: string, userIds: string[]) => {
  const displayNameMap = new Map<string, string>();
  if (userIds.length === 0) return displayNameMap;

  const rows = await db
    .select({ displayName: getDisplayNameExpression(usersToRoomsInMessage, usersInAuth), id: usersInAuth.id })
    .from(usersInAuth)
    .leftJoin(
      usersToRoomsInMessage,
      and(eq(usersToRoomsInMessage.userId, usersInAuth.id), eq(usersToRoomsInMessage.roomId, roomId)),
    )
    .where(inArray(usersInAuth.id, [...new Set(userIds)]));
  for (const { displayName, id } of rows) displayNameMap.set(id, displayName);
  return displayNameMap;
};
