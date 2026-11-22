import type { Context } from "#server/trpc/context";

import { inJsonArray } from "@esposter/db";
import { getLiveRowWhere, roomRolesInMessage, usersToRoomRolesInMessage } from "@esposter/db-schema";
import { and, eq, max } from "drizzle-orm";

export const getTopRolePositionByRoomId = async (db: Context["db"], userId: string, roomIds: string[]) => {
  const positions = await db
    .select({ maxPosition: max(roomRolesInMessage.position), roomId: roomRolesInMessage.roomId })
    .from(roomRolesInMessage)
    .innerJoin(usersToRoomRolesInMessage, eq(usersToRoomRolesInMessage.roleId, roomRolesInMessage.id))
    .where(
      and(
        eq(usersToRoomRolesInMessage.userId, userId),
        inJsonArray(roomRolesInMessage.roomId, roomIds),
        getLiveRowWhere(usersToRoomRolesInMessage),
        getLiveRowWhere(roomRolesInMessage),
      ),
    )
    .groupBy(roomRolesInMessage.roomId);
  return new Map(positions.map(({ maxPosition, roomId }) => [roomId, maxPosition ?? -1]));
};
