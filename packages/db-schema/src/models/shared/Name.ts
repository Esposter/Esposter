import type { PgColumn } from "drizzle-orm/pg-core";

import { normalizeString } from "@esposter/shared";
import { sql } from "drizzle-orm";
import { z } from "zod";

export const createNormalizedStringSchema = (maxLength: number, schema = z.string()) =>
  schema.overwrite((value) => normalizeString(value)).max(maxLength);

export const createNameSchema = (maxLength: number, schema = z.string()) =>
  createNormalizedStringSchema(maxLength, schema).min(1);

export const createNameCheckSql = (column: PgColumn, maxLength: number) =>
  sql`LENGTH(TRIM(${column})) BETWEEN 1 AND ${sql.raw(maxLength.toString())}`;
