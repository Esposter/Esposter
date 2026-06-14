import type { Context } from "@@/server/trpc/context";

import { roomRolesInMessage, usersToRoomRolesInMessage } from "@esposter/db-schema";
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
    .select({ maxPosition: max(roomRolesInMessage.position), roomId: roomRolesInMessage.roomId })
    .from(roomRolesInMessage)
    .innerJoin(usersToRoomRolesInMessage, eq(usersToRoomRolesInMessage.roleId, roomRolesInMessage.id))
    .where(and(eq(usersToRoomRolesInMessage.userId, userId), inArray(roomRolesInMessage.roomId, roomIdArray)))
    .groupBy(roomRolesInMessage.roomId);
  const positionMap = new Map(positions.map(({ maxPosition, roomId }) => [roomId, maxPosition ?? -1]));
  return Array.isArray(roomIds) ? positionMap : (positionMap.get(roomIds) ?? -1);
}) as GetTopRolePosition;
