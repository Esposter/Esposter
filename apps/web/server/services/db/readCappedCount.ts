import type { Context } from "#server/trpc/context";
import type { SQL } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { takeOne } from "@esposter/shared";
import { count, sql } from "drizzle-orm";

// The rows a filter matches, counted no further than `cap`. A count over a whole table walks every row it matches, so
// A count a render path or an unbounded list pays for is bounded here. One row past the cap is read, because only a
// Row beyond it proves the total is higher: a count of exactly the cap is exact, and isCapped is set for nothing else
export const readCappedCount = async (db: Context["db"], table: SQLiteTable, where: SQL | undefined, cap: number) => {
  const cappedRows = db
    .select({ matched: sql`1` })
    .from(table)
    .where(where)
    .limit(cap + 1)
    .as("cappedRows");
  const matchedCount = takeOne(await db.select({ count: count() }).from(cappedRows)).count;
  return { count: Math.min(matchedCount, cap), isCapped: matchedCount > cap };
};
