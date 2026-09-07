import type { ReorderRoomCategoriesInput } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

// A room category's position is its index in the displayed order — only rows whose stored position differs need updating
export const getRoomCategoryPositionUpdates = (roomCategories: RoomCategoryInMessage[]): ReorderRoomCategoriesInput =>
  roomCategories.flatMap(({ id, position }, index) => (position === index ? [] : [{ id, position: index }]));
