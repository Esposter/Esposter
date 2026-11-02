import type { RoomCategoryInMessage } from "@esposter/db-schema";

// A room sits under the reader's own category for it, and under no category when that one is no longer among the
// Reader's categories, so a category deleted elsewhere leaves its rooms uncategorized rather than out of the sidebar
export const resolveRoomCategoryId = (
  roomCategories: Pick<RoomCategoryInMessage, "id">[],
  categoryId: null | RoomCategoryInMessage["id"] | undefined,
): null | RoomCategoryInMessage["id"] => roomCategories.find(({ id }) => id === categoryId)?.id ?? null;
