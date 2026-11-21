import type { Draft } from "#src/models/shared/overlay/Draft";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { RowKeyOf } from "#src/models/shared/overlay/RowKeyOf";
import type { Table } from "#src/models/shared/overlay/Table";
import type { TableSource } from "#src/models/shared/overlay/TableSource";
import type { Versioned } from "#src/models/shared/overlay/Versioned";

// An entry that changes a row the overlay holds, and leaves a row it does not hold as it is, so the write it belongs to
// Changes nothing on screen. The change is written at each table: a spread of a partial patch over a row of a generic
// Table does not typecheck under exactOptionalPropertyTypes, and every caller's table is concrete
export const getHeldRowEntry =
  <TRow extends Versioned, TSource extends TableSource>(
    table: Table<TRow, TSource>,
    key: RowKeyOf<TSource>,
    change: (row: Readonly<Draft<TRow>>) => Draft<TRow>,
  ): Entry =>
  (view) => {
    const row = view.get(table, key);
    if (row) view.set(table, key, change(row));
  };
