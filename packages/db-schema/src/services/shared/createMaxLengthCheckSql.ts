import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

export const createMaxLengthCheckSql = (column: PgColumn, maxLength: number) =>
  sql`LENGTH(${column}) <= ${sql.raw(maxLength.toString())}`;
