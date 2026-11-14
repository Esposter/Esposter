import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { takeOne } from "@esposter/shared";
import { count, sql } from "drizzle-orm";

// The rows a filter matches, counted no further than `limit`. A count over a whole table walks every row it matches, so
// A count a render path or an unbounded list pays for is bounded here, and a caller that needs to tell exactly the limit
// From beyond it asks for one past the cap
export const readCappedCount = async (
  db: Context["db"],
  table: SQLiteTable,
  where: SQL | undefined,
  limit: number,
): Promise<number> => {
  const cappedRows = db
    .select({ matched: sql`1` })
    .from(table)
    .where(where)
    .limit(limit)
    .as("cappedRows");
  return takeOne(await db.select({ count: count() }).from(cappedRows)).count;
};
