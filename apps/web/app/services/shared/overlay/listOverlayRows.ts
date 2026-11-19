import type { Draft } from "#src/models/shared/overlay/Draft";
import type { PendingEntry } from "#src/models/shared/overlay/PendingEntry";
import type { SlotFor } from "#src/models/shared/overlay/SlotFor";
import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { clearDraft } from "#src/services/shared/overlay/clearDraft";
import { createDraft } from "#src/services/shared/overlay/createDraft";
import { createKeyedView } from "#src/services/shared/overlay/createKeyedView";
import { getResult, withFinalizer } from "@esposter/shared";

// The live rows of a table with the entries applied over held state in the order they were issued. An entry that throws
// Takes the view back to held state, since its overrides cannot be told apart from the other entries', and its error is
// Reported to its own write
export const listOverlayRows = <TRow extends Versioned>(
  slotFor: SlotFor,
  table: Table<TRow>,
  pendingEntries: PendingEntry[],
): readonly Readonly<Draft<TRow>>[] => {
  const draft = createDraft();
  const view = createKeyedView(slotFor, draft);
  let applying: PendingEntry | undefined;
  return getResult(() =>
    withFinalizer(
      () => {
        for (const pendingEntry of pendingEntries) {
          applying = pendingEntry;
          pendingEntry.entry(view);
        }
        applying = undefined;
        return slotFor(table).list();
      },
      () => {
        clearDraft(draft);
      },
    ),
  ).match(
    (rows) => rows,
    (error) => {
      const failedEntry = applying;
      applying = undefined;
      // A throwing entry stays pending until its write settles, so every recomputation runs it again: its error is
      // Reported once, and after the read, so an error handler never writes state while the view is being computed
      if (failedEntry && !failedEntry.reported) {
        failedEntry.reported = true;
        queueMicrotask(() => failedEntry.onError?.(error));
      }
      return slotFor(table).list();
    },
  );
};
