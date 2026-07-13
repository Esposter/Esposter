import type { ReorderRoomCategoriesInput } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

// A category's position is its index in the displayed order — only rows whose stored position differs need updating
export const getCategoryPositionUpdates = (categories: RoomCategoryInMessage[]): ReorderRoomCategoriesInput =>
  categories.flatMap(({ id, position }, index) => (position === index ? [] : [{ id, position: index }]));
