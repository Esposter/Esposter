import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// The held rows of one table, typed by its row
export interface Slot<TRow extends Versioned> {
  arrive: (row: TRow) => void;
  list: () => TRow[];
  table: Table<TRow>;
  versionOf: (key: RowKey) => number | undefined;
}
