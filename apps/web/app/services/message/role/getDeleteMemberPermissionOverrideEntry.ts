import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomMemberPermissionTable } from "#src/services/message/role/constants";
import { getRoomMemberPermissionRowKey } from "#src/services/message/role/getRoomMemberPermissionRowKey";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The override leaves the member at once, as a tombstone the server's version of it confirms
export const getDeleteMemberPermissionOverrideEntry = (roomId: string, userId: string, deletedAt: Date): Entry =>
  getHeldRowEntry(roomMemberPermissionTable, getRoomMemberPermissionRowKey(userId, roomId), (override) => ({
    ...override,
    deletedAt,
  }));
