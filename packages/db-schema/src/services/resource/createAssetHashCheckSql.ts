import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import { createExactLengthCheckSql } from "#src/services/shared/createExactLengthCheckSql";
import { sql } from "drizzle-orm";

// The lowercase hex SHA-256 an asset is stored under: 64 characters, each a lowercase hex digit. SQLite has no regex
// Operator, so the digit set is GLOB's character class, which is case-sensitive as the lowercase set requires
export const createAssetHashCheckSql = (column: SQLiteColumn) =>
  sql`${createExactLengthCheckSql(column, 64)} AND ${column} NOT GLOB '*[^0-9a-f]*'`;
