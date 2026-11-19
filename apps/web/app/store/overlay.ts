import type { OptimisticWriteOptions } from "#src/models/shared/overlay/OptimisticWriteOptions";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { createWriteQueue } from "#src/services/shared/overlay/createWriteQueue";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { settleWrite } from "#src/services/shared/overlay/settleWrite";
import { getSynchronizedFunction } from "@esposter/shared";

// The write registry of one Pinia instance: the held server rows of every table, the pending entries and the write
// Queue. It is the only writer of held state, and a store reads its rows through the view it returns
export const useOverlayStore = defineStore("overlay", () => {
  const slotFor = createSlotFor();
  const enqueue = createWriteQueue();
  const arrive = <TRow extends Versioned>(table: Table<TRow>, row: TRow) => {
    slotFor(table).arrive(row);
  };
  const view = <TRow extends Versioned>(table: Table<TRow>) => {
    const slot = slotFor(table);
    return computed(() => slot.list());
  };
  // The write is queued by the rows its entry touches, found by running the entry once now
  const writeOptimistic = (mutate: () => Promise<void>, { entry, onError }: OptimisticWriteOptions) => {
    const touches = recordTouches(slotFor, entry);
    getSynchronizedFunction(() => enqueue(touches, () => settleWrite(mutate, onError)))();
  };
  return { arrive, view, writeOptimistic };
});
