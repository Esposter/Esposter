import type { AnyColumn } from "drizzle-orm";

import { usersToRoomsInMessage } from "@esposter/db-schema";
import { getTableColumns, isNotNull, sql } from "drizzle-orm";

// A membership a removal left as a tombstone is revived by its conflict: the removal is cleared, and the row takes the
// Values a fresh membership is inserted with, so a rejoin reads as a new membership rather than the one that left. Every
// Column is taken from the insert except the key the conflict matches on and the version and update time the database
// Keeps itself. The set-where names only a tombstone, so a live membership is left alone and a repeat insert raises no version
const UNREVIVED_COLUMN_KEYS = new Set(["deletedAt", "roomId", "updatedAt", "userId", "version"]);
const excluded = (column: AnyColumn) => sql`excluded.${sql.identifier(column.name)}`;

export const getReviveMembershipConflict = () => ({
  set: {
    ...Object.fromEntries(
      Object.entries(getTableColumns(usersToRoomsInMessage))
        .filter(([key]) => !UNREVIVED_COLUMN_KEYS.has(key))
        .map(([key, column]) => [key, excluded(column)] as const),
    ),
    deletedAt: null,
  },
  setWhere: isNotNull(usersToRoomsInMessage.deletedAt),
  target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
});
