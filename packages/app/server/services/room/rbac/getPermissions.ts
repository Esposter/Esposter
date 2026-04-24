import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { and, eq, inArray, or } from "drizzle-orm";

export const getPermissions = async (db: Context["db"], userId: string, roomIds: string[]) => {
  const memberRoomIdsSubquery = db
    .select({ roomId: usersToRooms.roomId })
    .from(usersToRooms)
    .where(and(eq(usersToRooms.userId, userId), inArray(usersToRooms.roomId, roomIds)));
  const roleIdsSubquery = db
    .select({ id: usersToRoomRoles.roleId })
    .from(usersToRoomRoles)
    .where(and(eq(usersToRoomRoles.userId, userId), inArray(usersToRoomRoles.roomId, roomIds)));
  const rows = await db
    .select({ permissions: roomRoles.permissions, roomId: roomRoles.roomId })
    .from(roomRoles)
    .where(
      and(
        inArray(roomRoles.roomId, roomIds),
        or(
          and(eq(roomRoles.isEveryone, true), inArray(roomRoles.roomId, memberRoomIdsSubquery)),
          inArray(roomRoles.id, roleIdsSubquery),
        ),
      ),
    );
  const result = new Map<string, bigint>();
  for (const { roomId, permissions } of rows) result.set(roomId, (result.get(roomId) ?? 0n) | permissions);
  return result;
};
