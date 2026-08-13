import type { Database } from "@esposter/db-schema";

import { usersToRoomRolesInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

export const getRoleMemberIds = async (db: Database, roomId: string, roleIds: string[]): Promise<string[]> => {
  const members = await db
    .select({ userId: usersToRoomRolesInMessage.userId })
    .from(usersToRoomRolesInMessage)
    .where(and(eq(usersToRoomRolesInMessage.roomId, roomId), inArray(usersToRoomRolesInMessage.roleId, roleIds)));
  return [...new Set(members.map((m) => m.userId))];
};
