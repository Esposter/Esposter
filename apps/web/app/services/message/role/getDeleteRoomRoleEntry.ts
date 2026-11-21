import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomRoleTable } from "#src/services/message/role/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The role leaves every list at once, as a tombstone the server's version of it confirms
export const getDeleteRoomRoleEntry = (id: string, deletedAt: Date): Entry =>
  getHeldRowEntry(roomRoleTable, [id], (roomRole) => ({ ...roomRole, deletedAt }));
