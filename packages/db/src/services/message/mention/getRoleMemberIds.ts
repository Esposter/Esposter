import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { usersToRoomRolesInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

export const getRoleMemberIds = async (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  roleIds: string[],
): Promise<string[]> => {
  const members = await db
    .select({ userId: usersToRoomRolesInMessage.userId })
    .from(usersToRoomRolesInMessage)
    .where(and(eq(usersToRoomRolesInMessage.roomId, roomId), inArray(usersToRoomRolesInMessage.roleId, roleIds)));
  return [...new Set(members.map((m) => m.userId))];
};
