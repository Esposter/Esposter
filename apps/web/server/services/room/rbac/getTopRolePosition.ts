import type { Context } from "#server/trpc/context";

import { inJsonArray } from "@esposter/db";
import { getLiveRowWhere, roomRolesInMessage, usersToRoomRolesInMessage } from "@esposter/db-schema";
import { and, eq, max } from "drizzle-orm";

export function getTopRolePosition(db: Context["db"], userId: string, roomId: string): Promise<number>;
export function getTopRolePosition(db: Context["db"], userId: string, roomIds: string[]): Promise<Map<string, number>>;
export async function getTopRolePosition(db: Context["db"], userId: string, roomIds: string | string[]) {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  const positions = await db
    .select({ maxPosition: max(roomRolesInMessage.position), roomId: roomRolesInMessage.roomId })
    .from(roomRolesInMessage)
    .innerJoin(usersToRoomRolesInMessage, eq(usersToRoomRolesInMessage.roleId, roomRolesInMessage.id))
    .where(
      and(
        eq(usersToRoomRolesInMessage.userId, userId),
        inJsonArray(roomRolesInMessage.roomId, roomIdArray),
        getLiveRowWhere(usersToRoomRolesInMessage),
        getLiveRowWhere(roomRolesInMessage),
      ),
    )
    .groupBy(roomRolesInMessage.roomId);
  const positionMap = new Map(positions.map(({ maxPosition, roomId }) => [roomId, maxPosition ?? -1]));
  return Array.isArray(roomIds) ? positionMap : (positionMap.get(roomIds) ?? -1);
}
