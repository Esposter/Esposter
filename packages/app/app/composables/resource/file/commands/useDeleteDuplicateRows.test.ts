// @vitest-environment nuxt
import { createColumn } from "@/composables/resource/file/commands/createColumn.test";
import { createDataSource } from "@/composables/resource/file/commands/createDataSource.test";
import { createRow } from "@/composables/resource/file/commands/createRow.test";
import { setupCommandTest } from "@/composables/resource/file/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { KeepDuplicateMode } from "@/models/resource/file/commands/KeepDuplicateMode";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

describe(useDeleteDuplicateRows, () => {
  setupCommandTest();

  test("removes duplicate rows keeping first occurrence", () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 0, " ": 1 }), createRow({ "": 0, " ": 1 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    deleteDuplicateRows();

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
  });

  test("removes duplicate rows keeping last occurrence", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("a")], [createRow({ a: 1 }), createRow({ a: 2 }), createRow({ a: 1 })]);
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    deleteDuplicateRows(KeepDuplicateMode.Last);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data.a).toBe(2);
    expect(takeOne(dataSource.rows, 1).data.a).toBe(1);
  });

  test("keeps rows that differ in at least one column", () => {
    expect.hasAssertions();

    const ds = createDataSource(
      [createColumn(""), createColumn(" ")],
      [createRow({ "": 0, " ": 1 }), createRow({ "": 0, " ": 2 })],
    );
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    deleteDuplicateRows();

    expect(dataSource.rows).toHaveLength(2);
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores deleted duplicate rows", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 0 })]);
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;

    deleteDuplicateRows();
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("redo re-applies after undo", () => {
    expect.hasAssertions();

    const ds = createDataSource([createColumn("")], [createRow({ "": 0 }), createRow({ "": 0 })]);
    const { dataSource } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;

    deleteDuplicateRows();
    undo(dataSource);
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(1);
  });
});
