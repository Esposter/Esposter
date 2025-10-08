import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const rateLimiterFlexible = pgTable("rate_limiter_flexible", {
  expire: timestamp("expire"),
  key: text("key").primaryKey(),
  points: integer("points").notNull(),
});
