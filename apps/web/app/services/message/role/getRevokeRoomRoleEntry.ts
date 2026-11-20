import type { Entry } from "#src/models/shared/overlay/Entry";

import { userToRoomRoleTable } from "#src/services/message/role/constants";
import { getUserToRoomRoleRowKey } from "#src/services/message/role/getUserToRoomRoleRowKey";

// The assignment leaves the member at once, as a tombstone the server's version of it confirms
export const getRevokeRoomRoleEntry =
  (roomId: string, userId: string, roleId: string, deletedAt: Date): Entry =>
  (view) => {
    const key = getUserToRoomRoleRowKey(userId, roomId, roleId);
    const memberRole = view.get(userToRoomRoleTable, key);
    if (memberRole) view.set(userToRoomRoleTable, key, { ...memberRole, deletedAt });
  };
