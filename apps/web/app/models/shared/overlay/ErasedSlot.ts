import type { RowKey } from "#src/models/shared/overlay/RowKey";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// A slot with its row type erased, the one form every table's slot takes in a map. No parameter names a row type, so a
// Slot of any table is assignable to it, and `table` is the identity a typed slot is recovered by
export interface ErasedSlot {
  list: () => Versioned[];
  table: object;
  versionOf: (key: RowKey) => number | undefined;
}
