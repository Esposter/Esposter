import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// A CHECK's rendered SQL is what drizzle-kit diffs and what an applied migration already carries, so these
// Emit the exact strings the schema used to spell out inline — `src/schema.test.ts` snapshots every one of
// Them, which is what makes moving an idiom in here provably free of a migration.
export const createExactLengthCheckSql = (column: PgColumn, length: number) =>
  sql`LENGTH(${column}) = ${sql.raw(length.toString())}`;

export const createMaxLengthCheckSql = (column: PgColumn, maxLength: number) =>
  sql`LENGTH(${column}) <= ${sql.raw(maxLength.toString())}`;

export const createBetweenCheckSql = (column: PgColumn, minimum: number, maximum: number) =>
  sql`${column} BETWEEN ${sql.raw(minimum.toString())} AND ${sql.raw(maximum.toString())}`;
