import type { Context } from "@@/server/trpc/context";

import { getPermission } from "@@/server/services/room/rbac/getPermission";
import { RoomPermission } from "@esposter/shared";

export const hasPermission = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  roomPermission: RoomPermission,
): Promise<boolean> => {
  const room = await db.query.rooms.findFirst({
    columns: { userId: true },
    where: (rooms, { eq }) => eq(rooms.id, roomId),
  });
  if (!room) return false;
  else if (room.userId === userId) return true;

  const permission = await getPermission(db, userId, roomId);
  if ((permission & RoomPermission.Administrator) !== 0n) return true;
  return (permission & roomPermission) !== 0n;
};
