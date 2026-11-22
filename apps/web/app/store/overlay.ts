import type { Arrival } from "#src/models/shared/overlay/Arrival";
import type { AwaitedWriteOptions } from "#src/models/shared/overlay/AwaitedWriteOptions";
import type { HeldTables } from "#src/models/shared/overlay/HeldTables";
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
import { getResult, getResultAsync, getSynchronizedFunction } from "@esposter/shared";

// The write registry of one Pinia instance: the held server rows of every table, the pending entries and the write
// Queue. It is the only writer of held state, and a store reads its rows through the view it returns
export const useOverlayStore = defineStore("overlay", () => {
  // The held rows are the store's state, so Pinia carries them in a server render's payload and a client's first render
  // Draws the rows the server drew, with no read run again. Nothing else here is state: the pending entries hold functions
  const heldTables = shallowRef<HeldTables>({});
  const slotFor = createSlotFor(heldTables);
  const enqueue = createWriteQueue();
  // Pending entries in issue order. A shallow ref, since an entry is a function the view calls and not state it reads
  const pendingEntries = shallowRef<PendingEntry[]>([]);
  const settlePendingEntries = () => {
    pendingEntries.value = pendingEntries.value.filter((pendingEntry) => !checkIsSettled(pendingEntry, slotFor));
  };
  // Every row a response returned is an arrival, and the entries those rows confirm drop with them
  const applyArrivals = (arrivals: Arrival[]) => {
    for (const arrival of arrivals) arrival(slotFor);
    settlePendingEntries();
  };
  // Whether the row was not discarded as older, so a read whose effects follow its answer takes them unless it is late
  const arrive = <TRow extends Versioned>(table: Table<TRow>, row: TRow) => {
    const isApplied = slotFor(table).arrive(row);
    settlePendingEntries();
    return isApplied;
  };
  const view = <TRow extends Versioned>(table: Table<TRow>) =>
    computed(() => listOverlayRows(slotFor, table, pendingEntries.value));
  // The write's entry is applied at once and its queue key comes from the rows it touches, found by running it now. An
  // Entry that throws here cannot name its keys, so the write sends nothing and its error goes to the write
  const writeOptimistic = (mutate: () => Promise<WriteResponse>, { entry, onError }: OptimisticWriteOptions) => {
    getResult(() => recordTouches(slotFor, entry)).match(
      (touches) => {
        const pendingEntry: PendingEntry = { entry, onError };
        pendingEntries.value = [...pendingEntries.value, pendingEntry];
        getSynchronizedFunction(() =>
          enqueue(touches, () =>
            getResultAsync(mutate).match(
              (response) => {
                pendingEntry.confirmed = response.confirmed;
                applyArrivals(response.arrivals);
              },
              (error) => {
                pendingEntries.value = pendingEntries.value.filter((other) => other !== pendingEntry);
                onError?.(error);
              },
            ),
          ),
        )();
      },
      (error) => {
        onError?.(error);
      },
    );
  };
  // A write with no entry shows nothing until its answer, so it takes no queue key: the version gate orders its
  // Responses, and it is issued at once
  // Resolves whether the server kept the write, so a caller that closes a dialog or leaves a page on success reads it here
  const writeAwaited = (mutate: () => Promise<Arrival[]>, { onError }: AwaitedWriteOptions): Promise<boolean> =>
    getResultAsync(mutate).match(
      (arrivals) => {
        applyArrivals(arrivals);
        return true;
      },
      (error) => {
        onError?.(error);
        return false;
      },
    );
  return { arrive, heldTables, view, writeAwaited, writeOptimistic };
});
