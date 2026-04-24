import type { Context } from "@@/server/trpc/context";

import { roomRoles, usersToRoomRoles } from "@esposter/db-schema";
import { and, eq, inArray, max } from "drizzle-orm";

export const getTopRolePosition = async (db: Context["db"], userId: string, roomIds: string[]) => {
  const results = await db
    .select({ maxPosition: max(roomRoles.position), roomId: roomRoles.roomId })
    .from(roomRoles)
    .innerJoin(usersToRoomRoles, eq(usersToRoomRoles.roleId, roomRoles.id))
    .where(and(eq(usersToRoomRoles.userId, userId), inArray(roomRoles.roomId, roomIds)))
    .groupBy(roomRoles.roomId);
  return new Map(results.map(({ roomId, maxPosition }) => [roomId, maxPosition ?? -1]));
};
