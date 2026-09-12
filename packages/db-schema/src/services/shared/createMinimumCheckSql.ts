import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

export const createMinimumCheckSql = (column: PgColumn, minimum: number) =>
  sql`${column} >= ${sql.raw(minimum.toString())}`;
