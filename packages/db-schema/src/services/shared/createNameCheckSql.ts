import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// The column-level half of the Name field, whose schema half is `createNameSchema`: non-empty once trimmed and
// Within the same bound. Renders the exact string a schema spells out inline, for the reason
// `createExactLengthCheckSql` gives
export const createNameCheckSql = (column: PgColumn, maxLength: number) =>
  sql`LENGTH(TRIM(${column})) BETWEEN 1 AND ${sql.raw(maxLength.toString())}`;
