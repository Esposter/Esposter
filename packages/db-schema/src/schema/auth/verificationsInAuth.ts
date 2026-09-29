import { pgTable } from "#src/pgTable";
import { authSchema } from "#src/schema/auth/authSchema";
import { text, timestamp } from "drizzle-orm/pg-core";

export const verificationsInAuth = pgTable(
  "verifications",
  { expiresAt: timestamp().notNull(), id: text().primaryKey(), identifier: text().notNull(), value: text().notNull() },
  { schema: authSchema },
);
