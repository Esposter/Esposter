import type { Context } from "#server/trpc/context";
import type { DirectMessageParticipants } from "#shared/models/db/room/DirectMessageParticipants";
import type { RoomInMessage } from "@esposter/db-schema";

import { inJsonArray } from "@esposter/db";
import {
  getDisplayNameExpression,
  getLiveRowWhere,
  getPublicUserColumns,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getOrCreate } from "@esposter/shared";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// The other participants of the given direct messages, read for the viewer alone.
// A room the viewer is not in has no membership row to match, so it is never returned.
// Each participant is its live membership row, which the overlay holds at its version, and its name is the one the room shows.
// Grouped by room, and each room's names in the order the list sorts them.
export const readDirectMessageParticipants = async (
  db: Context["db"],
  userId: string,
  roomIds: RoomInMessage["id"][],
) => {
  const usersToRoomsInMessage1 = alias(usersToRoomsInMessage, "usersToRoomsInMessage1");
  const usersToRoomsInMessage2 = alias(usersToRoomsInMessage, "usersToRoomsInMessage2");
  const usersInAuth2 = alias(usersInAuth, "usersInAuth2");
  const participantDisplayName = getDisplayNameExpression(usersToRoomsInMessage2, usersInAuth2);
  const rows = await db
    .select({
      deletedAt: usersToRoomsInMessage2.deletedAt,
      displayName: participantDisplayName,
      roomId: usersToRoomsInMessage2.roomId,
      user: getPublicUserColumns(usersInAuth2),
      userId: usersToRoomsInMessage2.userId,
      version: usersToRoomsInMessage2.version,
    })
    .from(usersToRoomsInMessage1)
    .innerJoin(
      roomsInMessage,
      and(eq(roomsInMessage.id, usersToRoomsInMessage1.roomId), eq(roomsInMessage.type, RoomType.DirectMessage)),
    )
    .innerJoin(
      usersToRoomsInMessage2,
      and(
        eq(usersToRoomsInMessage2.roomId, usersToRoomsInMessage1.roomId),
        ne(usersToRoomsInMessage2.userId, userId),
        getLiveRowWhere(usersToRoomsInMessage2),
      ),
    )
    .innerJoin(usersInAuth2, eq(usersInAuth2.id, usersToRoomsInMessage2.userId))
    .where(
      and(
        eq(usersToRoomsInMessage1.userId, userId),
        inJsonArray(usersToRoomsInMessage1.roomId, roomIds),
        getLiveRowWhere(usersToRoomsInMessage1),
      ),
    )
    .orderBy(asc(sql<string>`${participantDisplayName} collate nocase`), asc(usersInAuth2.id));
  const roomIdParticipantsMap = new Map<string, DirectMessageParticipants["participants"]>();
  for (const row of rows) getOrCreate(roomIdParticipantsMap, row.roomId, () => []).push(row);
  return Array.from(roomIdParticipantsMap, ([roomId, participants]) => ({ participants, roomId }));
};
