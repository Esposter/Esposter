import type { OptimisticWriteOptions } from "#src/models/shared/overlay/OptimisticWriteOptions";
import type { PendingEntry } from "#src/models/shared/overlay/PendingEntry";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { WriteResponse } from "#src/models/shared/overlay/WriteResponse";

import { checkIsSettled } from "#src/services/shared/overlay/checkIsSettled";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { createWriteQueue } from "#src/services/shared/overlay/createWriteQueue";
import { listOverlayRows } from "#src/services/shared/overlay/listOverlayRows";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";

// The write registry of one Pinia instance: the held server rows of every table, the pending entries and the write
// Queue. It is the only writer of held state, and a store reads its rows through the view it returns
export const useOverlayStore = defineStore("overlay", () => {
  const slotFor = createSlotFor();
  const enqueue = createWriteQueue();
  // Pending entries in issue order. A shallow ref, since an entry is a function the view calls and not state it reads
  const pendingEntries = shallowRef<PendingEntry[]>([]);
  const settlePendingEntries = () => {
    pendingEntries.value = pendingEntries.value.filter((pendingEntry) => !checkIsSettled(pendingEntry, slotFor));
  };
  const arrive = <TRow extends Versioned>(table: Table<TRow>, row: TRow) => {
    slotFor(table).arrive(row);
    settlePendingEntries();
  };
  const view = <TRow extends Versioned>(table: Table<TRow>) =>
    computed(() =>
      listOverlayRows(
        slotFor,
        table,
        pendingEntries.value.map(({ entry }) => entry),
      ),
    );
  // The write's entry is applied at once and its queue key comes from the rows it touches, found by running it now
  const writeOptimistic = (mutate: () => Promise<WriteResponse>, { entry, onError }: OptimisticWriteOptions) => {
    const touches = recordTouches(slotFor, entry);
    const pendingEntry: PendingEntry = { entry };
    pendingEntries.value = [...pendingEntries.value, pendingEntry];
    getSynchronizedFunction(() =>
      enqueue(touches, () =>
        getResultAsync(mutate).match(
          (response) => {
            for (const arrival of response.arrivals) arrival(slotFor);
            pendingEntry.confirmed = response.confirmed;
            settlePendingEntries();
          },
          (error) => {
            pendingEntries.value = pendingEntries.value.filter((other) => other !== pendingEntry);
            onError?.(error);
          },
        ),
      ),
    )();
  };
  return { arrive, view, writeOptimistic };
});
