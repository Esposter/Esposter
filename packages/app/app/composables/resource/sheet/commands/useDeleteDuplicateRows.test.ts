// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/sheet/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/sheet/commands/createDataSource.test";
import { createRow } from "@/composables/resource/sheet/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useDeleteDuplicateRows, () => {
  setupCommandTest();

  test("removes duplicate rows keeping first occurrence", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 0, " ": 1 }), createRow({ "": 0, " ": 1 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    await deleteDuplicateRows();

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
  });

  test("removes duplicate rows keeping last occurrence", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("a")], [createRow({ a: 1 }), createRow({ a: 2 }), createRow({ a: 1 })]);
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    await deleteDuplicateRows(KeepDuplicateMode.Last);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data.a).toBe(2);
    expect(takeOne(dataSource.rows, 1).data.a).toBe(1);
  });

  test("keeps rows that differ in at least one column", async () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 0, " ": 2 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    await deleteDuplicateRows();

    expect(dataSource.rows).toHaveLength(2);
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores deleted duplicate rows", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 0 })]);
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;

    await deleteDuplicateRows();
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("redo re-applies after undo", async () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 0 })]);
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;

    await deleteDuplicateRows();
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(1);
  });
});
