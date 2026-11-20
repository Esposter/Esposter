import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomCategoryTable } from "#src/services/message/roomCategory/constants";

// The category leaves the list at once, as a tombstone the server's version of it confirms
export const getDeleteRoomCategoryEntry =
  (id: string, deletedAt: Date): Entry =>
  (view) => {
    const roomCategory = view.get(roomCategoryTable, [id]);
    if (roomCategory) view.set(roomCategoryTable, [id], { ...roomCategory, deletedAt });
  };
