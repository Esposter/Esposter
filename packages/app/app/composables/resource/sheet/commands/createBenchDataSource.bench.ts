import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { benchColumns } from "@/composables/resource/sheet/commands/constants.bench";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";

// The per-iteration fixture for every command bench: `bench()` runs its callback in a tight loop, and every
// Command mutates the data source it is handed, so each iteration needs one nothing else can see.
//
// Both levels have to be fresh, and neither is what a shallow `[...rows]` gives:
//
// - Columns, because `UpdateColumnCommand.execute` writes `dataSource.columns[index] = newColumn`. Handing it
//   `benchColumns` itself renames the shared column on the first iteration, after which `execute` finds no column
//   Named `a`, returns immediately, and every later iteration measures the early return rather than the rename.
//   A shallow copy is enough here: no command mutates a Column in place, they replace the element or the array.
// - Rows, because the commands write through `row.data` — `delete data[name]` (DeleteColumns) and `row.data =`
//   (Move, Update). Copying only the array leaves every iteration after the first working on a row whose data was
//   Already deleted or rewritten, so it measures a cheaper operation than the one it names.
//
// Rebuilding the rows is O(rows) inside the timing, which the bench conventions accept for a mutating op — and it
// Is the same order as the row rebuild the commands themselves do, so it does not drown the signal it costs.
export const createBenchDataSource = (rows: Row[]) =>
  createDataSource(
    [...benchColumns],
    rows.map((row) => createRow({ ...row.data })),
  );
