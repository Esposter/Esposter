import type { Draft } from "#src/models/shared/overlay/Draft";
import type { OverlayDraft } from "#src/models/shared/overlay/OverlayDraft";
import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// The held rows of one table, typed by its row. `read` and `write` go through a draft, which records the key touched
export interface Slot<TRow extends Versioned> {
  // False only when the row was discarded as older than the one held, so a reader can tell a current answer
  // From a late one
  arrive: (row: TRow) => boolean;
  list: () => Draft<TRow>[];
  read: (draft: OverlayDraft, key: RowKey) => Draft<TRow> | undefined;
  table: Table<TRow>;
  versionOf: (key: RowKey) => number | undefined;
  write: (draft: OverlayDraft, key: RowKey, row: Draft<TRow>) => void;
}
