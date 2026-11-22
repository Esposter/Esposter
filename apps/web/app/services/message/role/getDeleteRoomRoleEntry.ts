import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomRoleTable } from "#src/services/message/role/constants";
import { getRemovalEntry } from "#src/services/shared/overlay/getRemovalEntry";

// The role leaves every list at once, as a tombstone the server's version of it confirms
export const getDeleteRoomRoleEntry = (id: string, deletedAt: Date): Entry =>
  getRemovalEntry(roomRoleTable, [id], deletedAt);
