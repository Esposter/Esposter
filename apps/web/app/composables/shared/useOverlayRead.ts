import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { useOverlayStore } from "#src/store/overlay";

// A read whose rows arrive in one table of the overlay, keyed by that table. Each row the read returns goes through
// `toRow`, which stores the related rows the row carries and returns the row the table holds, so none arrives without them
export const useOverlayRead = <TRow extends Versioned, TReadRow>(
  table: Table<TRow>,
  toRow: (readRow: TReadRow) => TRow,
) => {
  const { executeQuery } = useMutation();
  const overlayStore = useOverlayStore();
  const { arrive } = overlayStore;
  return (read: () => Promise<TReadRow[]>) =>
    executeQuery(read, {
      key: table.name,
      onSuccess: (readRows) => {
        for (const readRow of readRows) arrive(table, toRow(readRow));
      },
    });
};
