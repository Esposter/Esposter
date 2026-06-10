import { getPermissions } from "@/services/message/rbac/getPermissions";
import { db } from "@/services/db";
import { RoomPermission } from "@esposter/db-schema";

export const hasPermission = async (userId: string, roomId: string, permission: RoomPermission): Promise<boolean> => {
  const room = await db.query.roomsInMessage.findFirst({
    columns: { userId: true },
    where: { id: { eq: roomId } },
  });
  if (!room) return false;
  else if (room.userId === userId) return true;

  const permissions = await getPermissions(userId, roomId);
  return Boolean(permissions & RoomPermission.Administrator) || (permissions & permission) === permission;
};
