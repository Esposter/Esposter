import { pgTable } from "@/pgTable";
import { integer, text, timestamp } from "drizzle-orm/pg-core";

export const rateLimiterFlexible = pgTable("rate_limiter_flexible", {
  expire: timestamp(),
  key: text().primaryKey(),
  points: integer().notNull(),
});
