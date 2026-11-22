import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { usersToRoomRolesInMessage } from "@esposter/db-schema";

// The key of an assignment row: the member, the room and the role, in the order the table's composite key names them
export const getUserToRoomRoleRowKey = (
  userId: string,
  roomId: string,
  roleId: string,
): RowKeyOf<typeof usersToRoomRolesInMessage> => [userId, roomId, roleId];
