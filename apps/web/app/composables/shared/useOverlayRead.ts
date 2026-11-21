import type { Table } from "#src/models/shared/overlay/Table";
import type { Versioned } from "#src/models/shared/overlay/Versioned";
import type { Promisable } from "type-fest";

import { useOverlayStore } from "#src/store/overlay";

interface OverlayReadOptions<TReadRow> {
  // Keyed by the table unless the read names the target it is for, such as a room or one surface's read of a member:
  // A read of one target must not supersede a read of another, so the caller names each target it reads
  key?: PropertyKey;
  onError?: (error: Error) => Promisable<void>;
  // Runs after the rows the read returned have arrived
  onSuccess?: (readRows: TReadRow[]) => Promisable<void>;
}

// A read whose rows arrive in one table of the overlay. Each row the read returns goes through `toRow`, which stores the
// Related rows the row carries and returns the row the table holds, so none arrives without them
export const useOverlayRead = <TRow extends Versioned, TReadRow>(
  table: Table<TRow>,
  toRow: (readRow: TReadRow) => TRow,
) => {
  const { executeQuery } = useMutation();
  const overlayStore = useOverlayStore();
  const { arrive } = overlayStore;
  return (
    read: () => Promise<TReadRow[]>,
    { key = table.name, onError, onSuccess }: OverlayReadOptions<TReadRow> = {},
  ) =>
    executeQuery(read, {
      key,
      onError,
      onSuccess: async (readRows) => {
        for (const readRow of readRows) arrive(table, toRow(readRow));
        await onSuccess?.(readRows);
      },
    });
};
