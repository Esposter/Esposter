import type { DatabaseSchema } from "#src/models/DatabaseSchema";

import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

// SQLite has no schemas, so each schema is a table-name prefix: `message` + `rooms` is `message_rooms`.
// The prefix keeps every table's SQL name unique across the folders
export const createDatabaseSchema = <TName extends string>(name: TName): DatabaseSchema<TName> => ({
  name,
  table: sqliteTableCreator((tableName) => `${name}_${tableName}`, "camelCase"),
});
