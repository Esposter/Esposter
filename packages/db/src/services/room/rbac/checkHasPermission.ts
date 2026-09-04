import type { Database } from "@esposter/db-schema";

import { getPermissions } from "#src/services/room/rbac/getPermissions";
import { checkHasPermission as baseCheckHasPermission, RoomPermission } from "@esposter/db-schema";

export const checkHasPermission = async (
  db: Database,
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
  // What the bits mean is `@esposter/db-schema`'s to say, so this function is only the query around it.
  // The owner already returned above — reaching here means the caller is not one
  return baseCheckHasPermission(permissions, permission, false);
};
