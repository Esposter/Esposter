import { pgTable } from "#src/pgTable";
import { appSchema } from "#src/schema/app/appSchema";
import { integer, text, timestamp } from "drizzle-orm/pg-core";

export const rateLimiterFlexibleInApp = pgTable(
  "rateLimiterFlexible",
  { expire: timestamp(), key: text().primaryKey(), points: integer().notNull() },
  { schema: appSchema },
);
