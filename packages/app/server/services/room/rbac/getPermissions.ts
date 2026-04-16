import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles } from "@esposter/db-schema";
import { and, eq, inArray, or } from "drizzle-orm";

export const getPermissions = async (db: Context["db"], userId: string, roomId: string): Promise<bigint> => {
  const roleIdSubquery = db
    .select({ id: usersToRoomRoles.roleId })
    .from(usersToRoomRoles)
    .where(and(eq(usersToRoomRoles.userId, userId), eq(usersToRoomRoles.roomId, roomId)));
  const rows = await db
    .select({ permissions: roomRoles.permissions })
    .from(roomRoles)
    .where(
      and(eq(roomRoles.roomId, roomId), or(eq(roomRoles.isEveryone, true), inArray(roomRoles.id, roleIdSubquery))),
    );
  return rows.reduce((acc, { permissions }) => acc | permissions, 0n);
};
