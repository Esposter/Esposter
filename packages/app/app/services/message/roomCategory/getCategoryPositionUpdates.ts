import type { UpdateRoomCategoryInput } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import type { RoomCategoryInMessage } from "@esposter/db-schema";

// A category's position is its index in the displayed order — only rows whose stored position differs need updating
export const getCategoryPositionUpdates = (categories: RoomCategoryInMessage[]): UpdateRoomCategoryInput[] =>
  categories.flatMap(({ id, position }, index) => (position === index ? [] : [{ id, position: index }]));
