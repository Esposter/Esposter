import { pgTable } from "@/pgTable";
import { text, timestamp } from "drizzle-orm/pg-core";

export const verifications = pgTable("verifications", {
  expiresAt: timestamp().notNull(),
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
});
