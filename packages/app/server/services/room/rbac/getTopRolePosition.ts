import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles } from "@esposter/db-schema";
import { and, eq, inArray, max } from "drizzle-orm";

interface GetTopRolePosition {
  (db: Context["db"], userId: string, roomId: string): Promise<number>;
  (db: Context["db"], userId: string, roomIds: string[]): Promise<Map<string, number>>;
}

export const getTopRolePosition: GetTopRolePosition = (async (
  db: Context["db"],
  userId: string,
  roomIds: string | string[],
): Promise<Map<string, number> | number> => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  const positions = await db
    .select({ maxPosition: max(roomRoles.position), roomId: roomRoles.roomId })
    .from(roomRoles)
    .innerJoin(usersToRoomRoles, eq(usersToRoomRoles.roleId, roomRoles.id))
    .where(and(eq(usersToRoomRoles.userId, userId), inArray(roomRoles.roomId, roomIdArray)))
    .groupBy(roomRoles.roomId);
  const positionMap = new Map(positions.map(({ maxPosition, roomId }) => [roomId, maxPosition ?? -1]));
  return Array.isArray(roomIds) ? positionMap : (positionMap.get(roomIds) ?? -1);
}) as GetTopRolePosition;
