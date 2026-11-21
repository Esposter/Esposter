import type { Entry } from "#src/models/shared/overlay/Entry";

import { userToRoomRoleTable } from "#src/services/message/role/constants";
import { getUserToRoomRoleRowKey } from "#src/services/message/role/getUserToRoomRoleRowKey";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The assignment leaves the member at once, as a tombstone the server's version of it confirms
export const getRevokeRoomRoleEntry = (roomId: string, userId: string, roleId: string, deletedAt: Date): Entry =>
  getHeldRowEntry(userToRoomRoleTable, getUserToRoomRoleRowKey(userId, roomId, roleId), (memberRole) => ({
    ...memberRole,
    deletedAt,
  }));
