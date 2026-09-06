import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// Renders the exact string a schema spells out inline, for the reason `createExactLengthCheckSql` gives
export const createBetweenCheckSql = (column: PgColumn, minimum: number, maximum: number) =>
  sql`${column} BETWEEN ${sql.raw(minimum.toString())} AND ${sql.raw(maximum.toString())}`;
