import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomCategoryTable } from "#src/services/message/roomCategory/constants";
import { getRemovalEntry } from "#src/services/shared/overlay/getRemovalEntry";

// The category leaves the list at once, as a tombstone the server's version of it confirms
export const getDeleteRoomCategoryEntry = (id: string, deletedAt: Date): Entry =>
  getRemovalEntry(roomCategoryTable, [id], deletedAt);
