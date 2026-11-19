import type { ErasedSlot } from "#src/models/shared/overlay/ErasedSlot";
import type { Slot } from "#src/models/shared/overlay/Slot";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// A slot is kept by table name, so the table object is what proves the slot holds that table's row type
export const checkIsSlotOf = <TRow extends Versioned>(table: Table<TRow>, slot: ErasedSlot): slot is Slot<TRow> =>
  slot.table === table;
