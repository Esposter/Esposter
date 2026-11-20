import type { Context } from "#server/trpc/context";

import { friendsInSocial, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, exists, isNull, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";

// Who may read a status: its owner, the owner's friends and the users who share a room with the owner. Each friend or
// Roommate branch is a correlated subquery over the candidate row in usersInAuth, so the visibility is one condition
// The read applies to every id it names rather than a check per id
export const getStatusVisibleWhere = (db: Context["db"], viewerId: string) => {
  const viewerRoom = alias(usersToRoomsInMessage, "viewerRoom");
  return or(
    eq(usersInAuth.id, viewerId),
    exists(
      db
        .select({ _: sql`1` })
        .from(friendsInSocial)
        .where(
          and(
            isNull(friendsInSocial.deletedAt),
            or(
              and(eq(friendsInSocial.senderId, viewerId), eq(friendsInSocial.receiverId, usersInAuth.id)),
              and(eq(friendsInSocial.receiverId, viewerId), eq(friendsInSocial.senderId, usersInAuth.id)),
            ),
          ),
        ),
    ),
    exists(
      db
        .select({ _: sql`1` })
        .from(usersToRoomsInMessage)
        .innerJoin(viewerRoom, eq(viewerRoom.roomId, usersToRoomsInMessage.roomId))
        .where(and(eq(usersToRoomsInMessage.userId, usersInAuth.id), eq(viewerRoom.userId, viewerId))),
    ),
  );
};
