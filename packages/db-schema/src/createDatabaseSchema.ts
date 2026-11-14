import type { DatabaseSchema } from "#src/models/DatabaseSchema";

import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

// SQLite has no schemas, so a Postgres schema survives as a table-name prefix: `message` + `rooms` is `message_rooms`.
// The prefix keeps every table's SQL name unique across the folders exactly as the schema did
export const createDatabaseSchema = <TName extends string>(name: TName): DatabaseSchema<TName> => ({
  name,
  table: sqliteTableCreator((tableName) => `${name}_${tableName}`, "camelCase"),
});
