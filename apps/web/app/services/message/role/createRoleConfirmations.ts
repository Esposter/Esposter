import type { Confirmation } from "#src/models/shared/overlay/Confirmation";
import type { RowVersion } from "@esposter/db-schema";

import { roomMemberPermissionTable, roomRoleTable, userToRoomRoleTable } from "#src/services/message/role/constants";
import { getRoomMemberPermissionRowKey } from "#src/services/message/role/getRoomMemberPermissionRowKey";
import { getUserToRoomRoleRowKey } from "#src/services/message/role/getUserToRoomRoleRowKey";
import { createConfirmation } from "#src/services/shared/overlay/createConfirmation";

// The rows a write's answer named, as the confirmations its entry waits for. A row of a table the role entries do not show
// Confirms none
export const createRoleConfirmations = (rowVersions: RowVersion[]): Confirmation[] =>
  rowVersions.flatMap(({ key, table, version }) => {
    const { id, roleId, roomId, userId } = key;
    if (table === roomRoleTable.name && id !== undefined) return [createConfirmation(roomRoleTable, [id], version)];
    if (table === userToRoomRoleTable.name && userId !== undefined && roomId !== undefined && roleId !== undefined)
      return [createConfirmation(userToRoomRoleTable, getUserToRoomRoleRowKey(userId, roomId, roleId), version)];
    if (table === roomMemberPermissionTable.name && userId !== undefined && roomId !== undefined)
      return [createConfirmation(roomMemberPermissionTable, getRoomMemberPermissionRowKey(userId, roomId), version)];
    return [];
  });
