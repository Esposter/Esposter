import type { CompositeKeyColumns } from "#src/models/shared/overlay/CompositeKeyColumns";
import type { PrimaryKeyColumnName } from "#src/models/shared/overlay/PrimaryKeyColumnName";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// A table's key columns in key order: its declared composite key, or its one primary-key column
export type KeyColumnNames<TSource extends SQLiteTable> = TSource["_"]["name"] extends keyof CompositeKeyColumns
  ? CompositeKeyColumns[TSource["_"]["name"]]
  : readonly [PrimaryKeyColumnName<TSource>];
