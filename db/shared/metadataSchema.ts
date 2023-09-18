import { pgTable, timestamp } from "drizzle-orm/pg-core";

export const metadataSchema = {
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  // @TODO: https://github.com/drizzle-team/drizzle-orm/issues/956
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  deletedAt: timestamp("deletedAt", { mode: "date" }),
} satisfies Parameters<typeof pgTable>[1];
