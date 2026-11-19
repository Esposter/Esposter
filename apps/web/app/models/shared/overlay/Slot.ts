import type { Draft } from "#src/models/shared/overlay/Draft";
import type { OverlayDraft } from "#src/models/shared/overlay/OverlayDraft";
import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// The held rows of one table, typed by its row. `read` and `write` go through a draft, which records the key touched
export interface Slot<TRow extends Versioned> {
  arrive: (row: TRow) => void;
  list: () => TRow[];
  read: (draft: OverlayDraft, key: RowKey) => Draft<TRow> | undefined;
  table: Table<TRow>;
  versionOf: (key: RowKey) => number | undefined;
  write: (draft: OverlayDraft, key: RowKey, row: Draft<TRow>) => void;
}
