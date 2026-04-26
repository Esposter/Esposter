import type { Context } from "@@/server/trpc/context";

import { roomRolesInMessageInMessage, usersToRoomRolesInMessageInMessage, usersToRoomsInMessageInMessage } from "@esposter/db-schema";
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
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(and(eq(usersToRoomsInMessage.userId, userId), inArray(usersToRoomsInMessage.roomId, roomIdArray)));
  const roleIdsSubquery = db
    .select({ id: usersToRoomRolesInMessage.roleId })
    .from(usersToRoomRolesInMessage)
    .where(and(eq(usersToRoomRolesInMessage.userId, userId), inArray(usersToRoomRolesInMessage.roomId, roomIdArray)));
  const rows = await db
    .select({ permissions: roomRolesInMessage.permissions, roomId: roomRolesInMessage.roomId })
    .from(roomRolesInMessage)
    .where(
      and(
        inArray(roomRolesInMessage.roomId, roomIdArray),
        or(
          and(eq(roomRolesInMessage.isEveryone, true), inArray(roomRolesInMessage.roomId, memberRoomIdsSubquery)),
          inArray(roomRolesInMessage.id, roleIdsSubquery),
        ),
      ),
    );
  const result = new Map<string, bigint>();
  for (const { permissions, roomId } of rows) result.set(roomId, (result.get(roomId) ?? 0n) | permissions);
  return Array.isArray(roomIds) ? result : (result.get(roomIds) ?? 0n);
}) as GetPermissions;
