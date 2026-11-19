import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";

// The write registry of one Pinia instance: the held server rows of every table, the pending entries and the write
// Queue. It is the only writer of held state, and a store reads its rows through the view it returns
export const useOverlayStore = defineStore("overlay", () => {
  const slotFor = createSlotFor();
  const arrive = <TRow extends Versioned>(table: Table<TRow>, row: TRow) => {
    slotFor(table).arrive(row);
  };
  const view = <TRow extends Versioned>(table: Table<TRow>) => {
    const slot = slotFor(table);
    return computed(() => slot.list());
  };
  return { arrive, view };
});
