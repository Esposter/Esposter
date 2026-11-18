import type { Context } from "#server/trpc/context";

import {
  getDisplayNameExpression,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// One ordered name per direct message, built from the other participants only; the id tie-breaker keeps equal names
// In the same order across the switcher's page cursor and the participant list. The viewer is left out by the join's
// Condition rather than a WHERE, so each direct message keeps its own rows and a read of it names them by their room. The rows
// Group by the room, so a direct message the viewer is alone in gets a row keyed by its room, not a null room's row.
export const getDirectMessageDisplayNames = (db: Context["db"], userId: string) => {
  const participantMembership = alias(usersToRoomsInMessage, "participantMembership");
  const participantUser = alias(usersInAuth, "participantUser");
  const participantDisplayName = getDisplayNameExpression(participantMembership, participantUser);
  return db
    .select({
      displayName:
        sql<string>`group_concat(${participantDisplayName}, ', ' ORDER BY ${participantDisplayName} collate nocase, ${participantUser.id})`.as(
          "displayName",
        ),
      roomId: roomsInMessage.id,
    })
    .from(roomsInMessage)
    .leftJoin(
      participantMembership,
      and(eq(participantMembership.roomId, roomsInMessage.id), ne(participantMembership.userId, userId)),
    )
    .leftJoin(participantUser, eq(participantUser.id, participantMembership.userId))
    .where(
      and(
        eq(roomsInMessage.type, RoomType.DirectMessage),
        inArray(
          roomsInMessage.id,
          db
            .select({ roomId: usersToRoomsInMessage.roomId })
            .from(usersToRoomsInMessage)
            .where(eq(usersToRoomsInMessage.userId, userId)),
        ),
      ),
    )
    .groupBy(roomsInMessage.id)
    .as("directMessageDisplayNames");
};
