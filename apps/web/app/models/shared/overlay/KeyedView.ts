import type { Draft } from "#src/models/shared/overlay/Draft";
import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { Table } from "#src/models/shared/overlay/Table";
import type { TableSource } from "#src/models/shared/overlay/TableSource";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// What an entry sees: rows read and written by key, and nothing that enumerates, counts or searches them. A key has one
// Level per key column of its table, each typed by that column
export interface KeyedView {
  get: <TRow extends Versioned, TSource extends TableSource>(
    table: Table<TRow, TSource>,
    key: NoInfer<RowKeyOf<TSource>>,
  ) => Readonly<Draft<TRow>> | undefined;
  set: <TRow extends Versioned, TSource extends TableSource>(
    table: Table<TRow, TSource>,
    key: NoInfer<RowKeyOf<TSource>>,
    row: Draft<TRow>,
  ) => void;
}
