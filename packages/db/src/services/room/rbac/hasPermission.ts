import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getPermissions } from "@/services/room/rbac/getPermissions";
import { RoomPermission } from "@esposter/db-schema";

export const hasPermission = async (
  db: PostgresJsDatabase<typeof relations>,
  userId: string,
  roomId: string,
  permission: RoomPermission,
): Promise<boolean> => {
  const room = await db.query.roomsInMessage.findFirst({
    columns: { userId: true },
    where: { id: { eq: roomId } },
  });
  if (!room) return false;
  else if (room.userId === userId) return true;

  const permissions = await getPermissions(db, userId, roomId);
  if (!permissions) return false;
  return Boolean(permissions & RoomPermission.Administrator) || (permissions & permission) === permission;
};
