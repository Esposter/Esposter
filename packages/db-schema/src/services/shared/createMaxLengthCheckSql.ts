import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

export const createMaxLengthCheckSql = (column: SQLiteColumn, maxLength: number) =>
  sql`LENGTH(${column}) <= ${sql.raw(maxLength.toString())}`;
