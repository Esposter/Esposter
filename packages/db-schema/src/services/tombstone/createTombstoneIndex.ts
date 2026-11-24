import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";
import { index } from "drizzle-orm/sqlite-core";

// The partial index the nightly purge reads a table's tombstones through, named for the table's bare noun. It holds
// Only the rows a soft delete set, so it is the size of the tombstone set. The predicate is spelled as the purge spells
// Its own filter, which is what lets the planner use it. The registry test names each table in the purge that lacks it
export const createTombstoneIndex = (table: string, deletedAt: SQLiteColumn) =>
  index(`${table}_deletedAt_index`)
    .on(deletedAt)
    .where(sql`${deletedAt} IS NOT NULL`);
