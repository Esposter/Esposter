import type { StreamTable } from "#src/models/streams/StreamTable";

import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Every StreamTable is one D1 table of the same four columns: the two keys, the etag a write rotates and the
// entity's other properties as JSON. The keys are the primary key, so a partition's rows read in rowKey order the way
// Azure Table returned them. Built here and nowhere else, so no table can drift from the others
export const createStreamTable = <TName extends StreamTable>(name: TName) =>
  sqliteTable(
    name,
    {
      entity: text({ mode: "json" }).$type<Record<string, unknown>>().notNull(),
      etag: text().notNull(),
      partitionKey: text().notNull(),
      rowKey: text().notNull(),
    },
    (table) => [primaryKey({ columns: [table.partitionKey, table.rowKey] })],
  );
