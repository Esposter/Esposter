import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";

import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { getCascadeTombstones } from "#server/services/tombstone/getCascadeTombstones";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, isNotNull } from "drizzle-orm";

// The statements that remove one member from one room, for the caller to batch. The membership stays as a tombstone, so
// Its version rises and a late arrival of the row loses to the removal. It is the first statement, and `extraWhere`
// Guards only it: the roles and overrides it held follow it, tombstoned by its cascade once the membership is
// Tombstoned, so a client holding them sees the removal, and a later grant of the same role revives its own row. A
// Caller may batch a statement between the membership and its cascade, since the cascade reads the membership's own
// Tombstone
export const getRoomMembershipRemoval = (db: Context["db"], roomId: string, userId: string, extraWhere?: SQL) =>
  [
    db
      .update(usersToRoomsInMessage)
      .set({ deletedAt: new Date() })
      .where(and(getRoomMembershipWhere(roomId, userId), extraWhere))
      .returning(),
    ...getCascadeTombstones(
      db,
      usersToRoomsInMessage,
      and(
        eq(usersToRoomsInMessage.roomId, roomId),
        eq(usersToRoomsInMessage.userId, userId),
        isNotNull(usersToRoomsInMessage.deletedAt),
      ),
    ),
  ] as const;
