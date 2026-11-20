import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A room emoji is live until its deletion leaves it as a tombstone, so each reader of the room's emoji asks for live rows here,
// Including the count the cap is checked against and the name a new emoji may not take
export const getLiveRoomEmojiWhere = (roomEmoji: { deletedAt: SQLWrapper }) => isNull(roomEmoji.deletedAt);
