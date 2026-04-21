import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles, usersToRooms } from "@esposter/db-schema";
import { and, eq, exists, inArray, or } from "drizzle-orm";

export const getPermissions = async (db: Context["db"], userId: string, roomId: string): Promise<bigint> => {
  const roleIdSubquery = db
    .select({ id: usersToRoomRoles.roleId })
    .from(usersToRoomRoles)
    .where(and(eq(usersToRoomRoles.userId, userId), eq(usersToRoomRoles.roomId, roomId)));
  const memberSubquery = db
    .select({ roomId: usersToRooms.roomId })
    .from(usersToRooms)
    .where(and(eq(usersToRooms.userId, userId), eq(usersToRooms.roomId, roomId)));
  const rows = await db
    .select({ permissions: roomRoles.permissions })
    .from(roomRoles)
    .where(
      and(
        eq(roomRoles.roomId, roomId),
        or(and(eq(roomRoles.isEveryone, true), exists(memberSubquery)), inArray(roomRoles.id, roleIdSubquery)),
      ),
    );
  return rows.reduce((acc, { permissions }) => acc | permissions, 0n);
};
