import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

// A table's rows, read and written through one slot. `source` is the Drizzle table object the schema holds once, so two
// Table objects over one source are one table and share the rows held for it. Its type carries the key a row is read by
export interface Table<TRow extends Versioned, TSource extends SQLiteTable = SQLiteTable> {
  keyOf: (row: TRow) => RowKey;
  // The key a write's header names a row by, read from the row's scope values. None when the scope leaves a key value out
  keyOfScope: (scope: Record<string, string>) => RowKey | undefined;
  name: string;
  source: TSource;
}
