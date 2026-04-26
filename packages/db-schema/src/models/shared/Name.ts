import type { PgColumn } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { z } from "zod";

export const createNameSchema = (maxLength: number) => z.string().trim().min(1).max(maxLength);

export const createNameCheckSql = (column: PgColumn, maxLength: number) =>
  sql`LENGTH(TRIM(${column})) BETWEEN 1 AND ${sql.raw(maxLength.toString())}`;
