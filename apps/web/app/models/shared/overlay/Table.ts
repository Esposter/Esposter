import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

export interface Table<TRow extends Versioned> {
  keyOf: (row: TRow) => RowKey;
  name: string;
}
