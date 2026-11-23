import type { AnyColumn } from "drizzle-orm";

import { getScopeKeys } from "@esposter/db";
import { usersToRoomsInMessage } from "@esposter/db-schema";
import { getTableColumns, isNotNull, sql } from "drizzle-orm";

// A membership a removal left as a tombstone is revived by its conflict: the removal is cleared, and the row takes the
// Values a fresh membership is inserted with, so a rejoin reads as a new membership rather than the one that left.
// Every Column is taken from the insert except the scope the conflict matches on, read off the table's own declaration,
// And the Version and update time the database keeps itself. The set-where names only a tombstone, so a live membership
// Is left Alone and a repeat insert raises no version
const scopeKeys = getScopeKeys(usersToRoomsInMessage);
const UNREVIVED_COLUMN_KEYS = new Set([...scopeKeys, "deletedAt", "updatedAt", "version"]);
const excluded = (column: AnyColumn) => sql`excluded.${sql.identifier(column.name)}`;
const columnEntries = Object.entries(getTableColumns(usersToRoomsInMessage));

export const getReviveMembershipConflict = () => ({
  set: {
    ...Object.fromEntries(
      columnEntries
        .filter(([key]) => !UNREVIVED_COLUMN_KEYS.has(key))
        .map(([key, column]) => [key, excluded(column)] as const),
    ),
    deletedAt: null,
  },
  setWhere: isNotNull(usersToRoomsInMessage.deletedAt),
  target: columnEntries.filter(([key]) => scopeKeys.includes(key)).map(([, column]) => column),
});
