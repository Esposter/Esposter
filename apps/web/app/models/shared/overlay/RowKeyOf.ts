import type { CompositeKeyColumns } from "#src/models/shared/overlay/CompositeKeyColumns";
import type { KeyValue } from "#src/models/shared/overlay/KeyValue";
import type { TableSource } from "#src/models/shared/overlay/TableSource";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// The key a row of a table is read by: one level per key column, typed by the column it reads
export type RowKeyOf<TSource extends TableSource> = ValuesOf<KeyColumnNames<TSource>, TSource["$inferSelect"]>;

// A table's key columns in key order: its declared composite key, or its one primary-key column
type KeyColumnNames<TSource extends SQLiteTable> = TSource["_"]["name"] extends keyof CompositeKeyColumns
  ? CompositeKeyColumns[TSource["_"]["name"]]
  : readonly [PrimaryKeyColumnName<TSource>];

// The one column Drizzle types as a primary key, for a table whose key is not a declared composite
type PrimaryKeyColumnName<TSource extends SQLiteTable> = {
  [K in keyof TSource["_"]["columns"]]: TSource["_"]["columns"][K]["_"]["isPrimaryKey"] extends true ? K : never;
}[keyof TSource["_"]["columns"]];

// Homomorphic over its own tuple parameter, so the key stays a tuple and each level keeps its column's value type
type ValuesOf<TNames extends readonly PropertyKey[], TRow> = {
  [I in keyof TNames]: Extract<TRow[keyof TRow & TNames[I]], KeyValue>;
};
