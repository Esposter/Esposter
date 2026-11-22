import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// The one column Drizzle types as a primary key, for a table whose key is not a declared composite
export type PrimaryKeyColumnName<TSource extends SQLiteTable> = {
  [K in keyof TSource["_"]["columns"]]: TSource["_"]["columns"][K]["_"]["isPrimaryKey"] extends true ? K : never;
}[keyof TSource["_"]["columns"]];
