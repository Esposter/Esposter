import type { Draft } from "#src/models/shared/overlay/Draft";
import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// What an entry sees: rows read and written by key, and nothing that enumerates, counts or searches them
export interface KeyedView {
  get: <TRow extends Versioned>(table: Table<TRow>, key: RowKey) => Readonly<Draft<TRow>> | undefined;
  set: <TRow extends Versioned>(table: Table<TRow>, key: RowKey, row: Draft<TRow>) => void;
}
