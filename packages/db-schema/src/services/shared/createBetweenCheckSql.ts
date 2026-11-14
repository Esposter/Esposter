import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

export const createBetweenCheckSql = (column: SQLiteColumn, minimum: number, maximum: number) =>
  sql`${column} BETWEEN ${sql.raw(minimum.toString())} AND ${sql.raw(maximum.toString())}`;
