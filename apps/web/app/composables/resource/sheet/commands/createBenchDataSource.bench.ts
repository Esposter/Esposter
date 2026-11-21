import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { createColumn } from "#shared/models/resource/sheet/column/createColumn.test";
import { createDataSource } from "#shared/models/resource/sheet/datasource/createDataSource.test";
import { createRow } from "#shared/models/resource/sheet/datasource/createRow.test";
import { benchColumns } from "#src/composables/resource/sheet/commands/constants.bench";
import { describe } from "vitest";

// The per-iteration fixture for every command bench: `bench()` runs its callback in a tight loop, and every
// Command mutates the data source it is handed, so each iteration needs one nothing else can see.
//
// Both levels have to be fresh, and neither is what a shallow `[...rows]` gives:
//
// - Columns, because a command writes through the column objects, not only the array. `CreateRowsCommand` and
//   `DeleteRowsCommand` change each column's `size` in place, so a copy of the array alone shares those objects.
//   Every iteration then adds to the same counter. Handing over `benchColumns` itself is worse, because
//   `UpdateColumnCommand` writes `dataSource.columns[index]`. After a rename on the first iteration, the
//   `execute` finds no column named `a`, so every later one returns early and measures nothing.
// - Rows, because the commands write through `row.data`: `delete data[name]` (DeleteColumns) and `row.data =`
//   (Move, Update). Copying only the array leaves every iteration after the first working on rows already deleted.
//   Rows it rewrote are no better, so it measures a cheaper operation than the one it names.
//
// Rebuilding the rows is O(rows) inside the timing, which the bench conventions accept for a mutating op.
// It is the same order as the row rebuild the commands do, so it does not drown the signal it costs.
export const createBenchDataSource = (rows: ToData<Row>[]) =>
  createDataSource(
    benchColumns.map(({ name }) => createColumn(name)),
    rows.map((row) => createRow({ ...row.data })),
  );

describe.todo("createBenchDataSource");
