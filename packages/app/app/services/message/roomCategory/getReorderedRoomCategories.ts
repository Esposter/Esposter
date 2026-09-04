import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { takeOne } from "@esposter/shared";

// Undefined when the move cannot happen — the room category is unknown, or already at the edge it is moving
// Towards — so the caller skips the write rather than persisting an unchanged order
export const getReorderedRoomCategories = (
  roomCategories: RoomCategoryInMessage[],
  roomCategoryId: RoomCategoryInMessage["id"],
  direction: -1 | 1,
): RoomCategoryInMessage[] | undefined => {
  const fromIndex = roomCategories.findIndex(({ id }) => id === roomCategoryId);
  if (fromIndex === -1) return undefined;
  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= roomCategories.length) return undefined;
  const movedRoomCategory = takeOne(roomCategories, fromIndex);
  return roomCategories.toSpliced(fromIndex, 1).toSpliced(toIndex, 0, movedRoomCategory);
};
