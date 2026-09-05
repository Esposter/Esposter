// @vitest-environment nuxt
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { StringTransformationType } from "#shared/models/resource/sheet/column/transformation/string/StringTransformationType";
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { createUpdatedColumn } from "@/composables/resource/sheet/commands/createUpdatedColumn.test";
import { createUpdatedRow } from "@/composables/resource/sheet/commands/createUpdatedRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { NullStrategy } from "@/models/resource/sheet/commands/NullStrategy";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne, toRawDeep } from "@esposter/shared";
import { describe, expect, test } from "vitest";

interface UndoRedoInvariantCase {
  dataSource: DataSource;
  invoke: () => Promise<void>;
  name: string;
}

const createInvariantDataSource = () =>
  createDataSource(
    [createColumn("a"), createColumn("b"), createColumn("c")],
    [createRow({ a: " ", b: " ", c: " " }), createRow({ a: " ", b: " ", c: " " })],
  );
const createNullInvariantDataSource = () =>
  createDataSource([createColumn("a")], [createRow({ a: null }), createRow({ a: " " })]);
// Three rows, so the reorder case can move one across two positions. An adjacent swap is its own inverse, so
// It passes whether undo reverses the move or simply re-applies it, which is the bug worth catching
const createReorderInvariantDataSource = () =>
  createDataSource([createColumn("a")], [createRow({ a: "0" }), createRow({ a: "1" }), createRow({ a: "2" })]);
// The case calls its own composable rather than handing over an argument list — an array literal standing in
// For a parameter tuple widens (`[[firstId, secondId]]` becomes `string[][]`) and stops matching the one-tuple
const createCase = (name: string, dataSource: DataSource, invoke: (dataSource: DataSource) => Promise<void>) => ({
  dataSource,
  invoke: () => invoke(dataSource),
  name,
});

describe("undoRedoInvariants", () => {
  // Every command must be a true involution: undo returns the exact pre-execute state and redo the exact
  // Post-execute one. A move command whose undo repeats its own execute only holds for adjacent moves,
  // So the reorder cases below deliberately displace by more than one position
  const cases: UndoRedoInvariantCase[] = [
    createCase("useCreateColumn: appends a column", createInvariantDataSource(), () =>
      useCreateColumn()(createColumn("d")),
    ),
    createCase("useCreateRow: appends a row", createInvariantDataSource(), () => useCreateRow()()),
    createCase("useCreateRows: inserts rows at an index", createInvariantDataSource(), () =>
      useCreateRows()([createRow({ a: " ", b: " ", c: " " })], 1),
    ),
    createCase("useDeleteColumn: removes a column", createInvariantDataSource(), () => useDeleteColumn()("b")),
    createCase("useDeleteColumns: removes non-adjacent columns", createInvariantDataSource(), ({ columns }) =>
      useDeleteColumns()([takeOne(columns).id, takeOne(columns, 2).id]),
    ),
    createCase("useDeleteDuplicateRows: removes duplicate rows", createInvariantDataSource(), () =>
      useDeleteDuplicateRows()(),
    ),
    createCase("useDeleteRow: removes a row", createInvariantDataSource(), ({ rows }) =>
      useDeleteRow()(takeOne(rows).id),
    ),
    createCase("useDeleteRows: removes every row", createInvariantDataSource(), ({ rows }) =>
      useDeleteRows()([takeOne(rows).id, takeOne(rows, 1).id]),
    ),
    createCase("useFindReplace: replaces every match", createInvariantDataSource(), () => useFindReplace()(" ", "")),
    createCase(
      `useNullStrategy: ${NullStrategy.ReplaceWithNA} rewrites empty cells`,
      createNullInvariantDataSource(),
      () => useNullStrategy()(NullStrategy.ReplaceWithNA),
    ),
    createCase(`useNullStrategy: ${NullStrategy.DropRow} drops empty rows`, createNullInvariantDataSource(), () =>
      useNullStrategy()(NullStrategy.DropRow),
    ),
    // Three pasted rows over a two-row source, so the case covers the appended row as well as the overwritten
    // Ones — an appended row only round-trips if the command minted it once instead of once per execute
    createCase("usePasteRange: overwrites a range and appends past the last row", createInvariantDataSource(), () =>
      usePasteRange()(0, 0, [[""], [""], [""]], ["a", "b", "c"]),
    ),
    createCase("useReorderColumns: moves a column two positions", createInvariantDataSource(), ({ columns }) =>
      useReorderColumns()([takeOne(columns, 1), takeOne(columns, 2), takeOne(columns)]),
    ),
    createCase("useReorderRows: moves a row two positions", createReorderInvariantDataSource(), ({ rows }) =>
      useReorderRows()([takeOne(rows, 1), takeOne(rows, 2), takeOne(rows)]),
    ),
    createCase(
      `useStringTransformation: ${StringTransformationType.Trim} rewrites every string cell`,
      createInvariantDataSource(),
      () => useStringTransformation()(StringTransformationType.Trim),
    ),
    createCase("useToggleColumnVisibility: hides a column", createInvariantDataSource(), ({ columns }) =>
      useToggleColumnVisibility()(takeOne(columns).id),
    ),
    createCase("useUpdateColumn: renames a column", createInvariantDataSource(), ({ columns }) =>
      useUpdateColumn()("a", createUpdatedColumn(takeOne(columns), { name: "d" })),
    ),
    createCase("useUpdateRow: changes a cell", createInvariantDataSource(), ({ rows }) =>
      useUpdateRow()(createUpdatedRow(takeOne(rows), { data: { a: "", b: " ", c: " " } })),
    ),
  ];

  setupCommandTest();

  test.each(cases)("$name", async ({ dataSource: initialDataSource, invoke }) => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource(initialDataSource);
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    const beforeExecute = structuredClone(toRawDeep(dataSource));
    await invoke();
    const afterExecute = structuredClone(toRawDeep(dataSource));

    expect(afterExecute).not.toStrictEqual(beforeExecute);
    expect(undoDescription.value).not.toBe("");

    undo(dataSource);

    expect(structuredClone(toRawDeep(dataSource))).toStrictEqual(beforeExecute);

    redo(dataSource);

    expect(structuredClone(toRawDeep(dataSource))).toStrictEqual(afterExecute);
  });
});
