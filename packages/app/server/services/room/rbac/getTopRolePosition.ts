import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles } from "@esposter/db-schema";
import { and, eq, max } from "drizzle-orm";

export const getTopRolePosition = async (db: Context["db"], userId: string, roomId: string): Promise<number> => {
  const result = await db
    .select({ maxPosition: max(roomRoles.position) })
    .from(roomRoles)
    .innerJoin(usersToRoomRoles, eq(usersToRoomRoles.roleId, roomRoles.id))
    .where(and(eq(usersToRoomRoles.userId, userId), eq(usersToRoomRoles.roomId, roomId)));
  return result[0]?.maxPosition ?? -1;
};
