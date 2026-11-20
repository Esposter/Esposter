import type { ReorderRoomCategoriesInput } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { roomCategoryTable } from "#src/services/message/roomCategory/constants";

// Each category the reorder names takes its new position at once. A category it does not name keeps the position it has
export const getReorderRoomCategoriesEntry =
  (updates: ReorderRoomCategoriesInput): Entry =>
  (view) => {
    for (const { id, position } of updates) {
      const roomCategory = view.get(roomCategoryTable, [id]);
      if (roomCategory) view.set(roomCategoryTable, [id], { ...roomCategory, position });
    }
  };
