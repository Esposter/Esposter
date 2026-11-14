import type { SQLiteTableFn } from "drizzle-orm/sqlite-core";

export interface DatabaseSchema<TName extends string> {
  name: TName;
  table: SQLiteTableFn;
}
