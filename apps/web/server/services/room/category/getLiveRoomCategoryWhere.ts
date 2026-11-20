import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A category is live until its deletion leaves it as a tombstone, so each reader of a category asks for live rows here
export const getLiveRoomCategoryWhere = (roomCategory: { deletedAt: SQLWrapper }) => isNull(roomCategory.deletedAt);
