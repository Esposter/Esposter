import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

export const createDistinctCheckSql = (first: SQLiteColumn, second: SQLiteColumn) => sql`${first} != ${second}`;
