import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { takeOne } from "@esposter/shared";

// Undefined when the move cannot happen — the category is unknown, or already at the edge it is moving
// Towards — so the caller skips the write rather than persisting an unchanged order
export const getReorderedRoomCategories = (
  categories: RoomCategoryInMessage[],
  categoryId: RoomCategoryInMessage["id"],
  direction: -1 | 1,
): RoomCategoryInMessage[] | undefined => {
  const fromIndex = categories.findIndex(({ id }) => id === categoryId);
  if (fromIndex === -1) return undefined;
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= categories.length) return undefined;
  const movedCategory = takeOne(categories, fromIndex);
  return categories.toSpliced(fromIndex, 1).toSpliced(toIndex, 0, movedCategory);
};
