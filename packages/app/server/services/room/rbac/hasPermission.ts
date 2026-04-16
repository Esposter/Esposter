import type { Context } from "@@/server/trpc/context";

import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { RoomPermission } from "@esposter/db-schema";

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
  if ((permissions & RoomPermission.Administrator) !== 0n) return true;
  return (permissions & permission) !== 0n;
};
