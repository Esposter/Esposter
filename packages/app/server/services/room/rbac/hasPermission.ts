import type { Context } from "@@/server/trpc/context";
import type { RoomPermission } from "@esposter/db-schema";

import { hasPermission as hasPermissionPure } from "#shared/services/room/rbac/hasPermission";
import { getPermissions } from "@@/server/services/room/rbac/getPermissions";

export const hasPermission = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  permission: RoomPermission,
): Promise<boolean> => {
  const room = await db.query.rooms.findFirst({
    columns: { userId: true },
    where: (rooms, { eq }) => eq(rooms.id, roomId),
  });
  if (!room) return false;
  else if (room.userId === userId) return true;

  const permissions = await getPermissions(db, userId, roomId);
  return hasPermissionPure(permissions, permission, false);
};
