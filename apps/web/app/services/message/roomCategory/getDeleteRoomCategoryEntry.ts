import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomCategoryTable } from "#src/services/message/roomCategory/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// The category leaves the list at once, as a tombstone the server's version of it confirms
export const getDeleteRoomCategoryEntry = (id: string, deletedAt: Date): Entry =>
  getHeldRowEntry(roomCategoryTable, [id], (roomCategory) => ({ ...roomCategory, deletedAt }));
