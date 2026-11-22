import type { Entry } from "#src/models/shared/overlay/Entry";
import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { Table } from "#src/models/shared/overlay/Table";
import type { TableSource } from "#src/models/shared/overlay/TableSource";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// A removal leaves the row it holds as a tombstone at the deletion time its write is issued with, so the tombstone is
// The only shape a removal takes. A row the overlay does not hold is left as it is, as getHeldRowEntry leaves it
export const getRemovalEntry = <TRow extends Versioned & { deletedAt: Date | null }, TSource extends TableSource>(
  table: Table<TRow, TSource>,
  key: RowKeyOf<TSource>,
  deletedAt: Date,
): Entry => getHeldRowEntry(table, key, (row) => ({ ...row, deletedAt }));
