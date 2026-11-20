import type { Database } from "@esposter/db-schema";

import { inJsonArray } from "#src/services/shared/inJsonArray";
import { getLiveRowWhere, usersToRoomRolesInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const getRoleMemberIds = async (db: Database, roomId: string, roleIds: string[]): Promise<string[]> => {
  const members = await db
    .select({ userId: usersToRoomRolesInMessage.userId })
    .from(usersToRoomRolesInMessage)
    .where(
      and(
        eq(usersToRoomRolesInMessage.roomId, roomId),
        inJsonArray(usersToRoomRolesInMessage.roleId, roleIds),
        getLiveRowWhere(usersToRoomRolesInMessage),
      ),
    );
  return [...new Set(members.map((member) => member.userId))];
};
