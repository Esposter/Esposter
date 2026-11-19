import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { describe } from "vitest";

// A table of versioned rows, the shape every overlay test writes its entries over
export const createRowTable = () =>
  sqliteTable("row", {
    deletedAt: integer({ mode: "timestamp_ms" }),
    id: text().primaryKey(),
    name: text().notNull(),
    version: integer().notNull(),
  });

describe.todo("createRowTable");
