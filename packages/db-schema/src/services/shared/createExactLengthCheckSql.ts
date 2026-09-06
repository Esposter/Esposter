import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// A CHECK's rendered SQL is what drizzle-kit diffs and what an applied migration already carries, so this emits
// The exact string a schema spells out inline — `src/schema.test.ts` snapshots every one of them, which is what
// Makes moving an idiom in here provably free of a migration.
export const createExactLengthCheckSql = (column: PgColumn, length: number) =>
  sql`LENGTH(${column}) = ${sql.raw(length.toString())}`;
