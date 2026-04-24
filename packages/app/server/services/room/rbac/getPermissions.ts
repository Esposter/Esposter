import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { and, eq, inArray, or } from "drizzle-orm";

interface GetPermissions {
  (db: Context["db"], userId: string, roomId: string): Promise<bigint>;
  (db: Context["db"], userId: string, roomIds: string[]): Promise<Map<string, bigint>>;
}

export const getPermissions: GetPermissions = (async (
  db: Context["db"],
  userId: string,
  roomIds: string | string[],
): Promise<bigint | Map<string, bigint>> => {
  const roomIdArray = Array.isArray(roomIds) ? roomIds : [roomIds];
  const memberRoomIdsSubquery = db
    .select({ roomId: usersToRooms.roomId })
    .from(usersToRooms)
    .where(and(eq(usersToRooms.userId, userId), inArray(usersToRooms.roomId, roomIdArray)));
  const roleIdsSubquery = db
    .select({ id: usersToRoomRoles.roleId })
    .from(usersToRoomRoles)
    .where(and(eq(usersToRoomRoles.userId, userId), inArray(usersToRoomRoles.roomId, roomIdArray)));
  const rows = await db
    .select({ permissions: roomRoles.permissions, roomId: roomRoles.roomId })
    .from(roomRoles)
    .where(
      and(
        inArray(roomRoles.roomId, roomIdArray),
        or(
          and(eq(roomRoles.isEveryone, true), inArray(roomRoles.roomId, memberRoomIdsSubquery)),
          inArray(roomRoles.id, roleIdsSubquery),
        ),
      ),
    );
  const result = new Map<string, bigint>();
  for (const { permissions, roomId } of rows) result.set(roomId, (result.get(roomId) ?? 0n) | permissions);
  if (Array.isArray(roomIds)) return result;
  return result.get(roomIds) ?? 0n;
}) as GetPermissions;
