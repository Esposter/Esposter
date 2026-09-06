import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// Renders the exact string a schema spells out inline, for the reason `createExactLengthCheckSql` gives
export const createMaxLengthCheckSql = (column: PgColumn, maxLength: number) =>
  sql`LENGTH(${column}) <= ${sql.raw(maxLength.toString())}`;
