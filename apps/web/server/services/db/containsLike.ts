import type { SQLWrapper } from "drizzle-orm";

import { escapeLike } from "#server/services/db/escapeLike";
import { sql } from "drizzle-orm";

// A substring match over a column or an expression, case-insensitive for ASCII as SQLite's LIKE is. SQLite has no
// Default escape character, so the one `escapeLike` writes is named here; without it a `\%` would match a backslash
export const containsLike = (column: SQLWrapper, value: string) =>
  sql`${column} like ${`%${escapeLike(value)}%`} escape '\\'`;
