import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomRoleTable } from "#src/services/message/role/constants";

// The role leaves every list at once, as a tombstone the server's version of it confirms
export const getDeleteRoomRoleEntry =
  (id: string, deletedAt: Date): Entry =>
  (view) => {
    const roomRole = view.get(roomRoleTable, [id]);
    if (roomRole) view.set(roomRoleTable, [id], { ...roomRole, deletedAt });
  };
