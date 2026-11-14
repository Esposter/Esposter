import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

export const createMinimumCheckSql = (column: SQLiteColumn, minimum: number) =>
  sql`${column} >= ${sql.raw(minimum.toString())}`;
