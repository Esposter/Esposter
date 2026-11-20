import type { friendRequestsInSocial, friendsInSocial } from "@esposter/db-schema";

import { isNotNull, sql } from "drizzle-orm";

// A friendship or request that a removal left as a tombstone is revived by its conflict: the removal is cleared, and the row
// Takes the direction of the incoming one, so it runs from the new sender to the new receiver
export const getReviveConflict = (table: typeof friendRequestsInSocial | typeof friendsInSocial) => ({
  set: {
    deletedAt: null,
    receiverId: sql`excluded.${sql.identifier(table.receiverId.name)}`,
    senderId: sql`excluded.${sql.identifier(table.senderId.name)}`,
  },
  setWhere: isNotNull(table.deletedAt),
  target: table.id,
});
