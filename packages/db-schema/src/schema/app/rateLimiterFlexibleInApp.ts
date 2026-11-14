import { appSchema } from "#src/schema/app/appSchema";
import { sqliteTable } from "#src/sqliteTable";
import { integer, text } from "drizzle-orm/sqlite-core";

export const rateLimiterFlexibleInApp = sqliteTable(
  "rateLimiterFlexible",
  { expire: integer({ mode: "timestamp_ms" }), key: text().primaryKey(), points: integer().notNull() },
  { schema: appSchema },
);
