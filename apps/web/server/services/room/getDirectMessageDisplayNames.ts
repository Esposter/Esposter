import type { Context } from "#server/trpc/context";

import {
  getDisplayNameExpression,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

// One ordered name per direct message, built from the other participants only; the id tie-breaker keeps equal names
// In the same order across the switcher's page cursor and the participant list.
export const getDirectMessageDisplayNames = (db: Context["db"], userId: string) => {
  const participantMembership = alias(usersToRoomsInMessage, "participantMembership");
  const participantUser = alias(usersInAuth, "participantUser");
  const participantDisplayName = getDisplayNameExpression(participantMembership, participantUser);
  return db
    .select({
      displayName:
        sql<string>`string_agg(${participantDisplayName}, ', ' ORDER BY ${participantDisplayName}, ${participantUser.id})`.as(
          "displayName",
        ),
      roomId: participantMembership.roomId,
    })
    .from(participantMembership)
    .innerJoin(
      roomsInMessage,
      and(eq(roomsInMessage.id, participantMembership.roomId), eq(roomsInMessage.type, RoomType.DirectMessage)),
    )
    .innerJoin(participantUser, eq(participantUser.id, participantMembership.userId))
    .where(ne(participantMembership.userId, userId))
    .groupBy(participantMembership.roomId)
    .as("directMessageDisplayNames");
};
