import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomMemberPermissionTable } from "#src/services/message/role/constants";
import { getRoomMemberPermissionRowKey } from "#src/services/message/role/getRoomMemberPermissionRowKey";

// The override leaves the member at once, as a tombstone the server's version of it confirms
export const getDeleteMemberPermissionOverrideEntry =
  (roomId: string, userId: string, deletedAt: Date): Entry =>
  (view) => {
    const key = getRoomMemberPermissionRowKey(userId, roomId);
    const override = view.get(roomMemberPermissionTable, key);
    if (override) view.set(roomMemberPermissionTable, key, { ...override, deletedAt });
  };
