import { authSchema } from "#src/schema/auth/authSchema";
import { sqliteTable } from "#src/sqliteTable";
import { integer, text } from "drizzle-orm/sqlite-core";

export const verificationsInAuth = sqliteTable(
  "verifications",
  {
    expiresAt: integer({ mode: "timestamp_ms" }).notNull(),
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
  },
  { schema: authSchema },
);
