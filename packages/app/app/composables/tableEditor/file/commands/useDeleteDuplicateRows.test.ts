import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useDeleteDuplicateRows, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("removes duplicate rows keeping first occurrence", () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": 0, " ": 1 }), makeRow({ "": 0, " ": 1 }), makeRow({ "": 0, " ": 1 })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    deleteDuplicateRows();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
  });

  test("keeps rows that differ in at least one column", () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn(""), makeColumn(" ")],
      [makeRow({ "": 0, " ": 1 }), makeRow({ "": 0, " ": 2 })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const { isUndoable } = useDataSourceHistory();
    deleteDuplicateRows();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(isUndoable.value).toBe(false);
  });

  test("undo restores deleted duplicate rows", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": 0 }), makeRow({ "": 0 })]);
    const { editedItem } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const { undo } = useDataSourceHistory();
    const editedItemValue = editedItem.value;

    expectToBeDefined(editedItemValue);

    deleteDuplicateRows();
    undo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("redo re-applies after undo", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": 0 }), makeRow({ "": 0 })]);
    const { editedItem } = setupWithDataSource(ds);
    const deleteDuplicateRows = useDeleteDuplicateRows();
    const { redo, undo } = useDataSourceHistory();
    const editedItemValue = editedItem.value;

    expectToBeDefined(editedItemValue);

    deleteDuplicateRows();
    undo(editedItemValue);
    redo(editedItemValue);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(1);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { isUndoable } = useDataSourceHistory();
    const deleteDuplicateRows = useDeleteDuplicateRows();
    deleteDuplicateRows();

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { isUndoable } = useDataSourceHistory();
    const deleteDuplicateRows = useDeleteDuplicateRows();
    deleteDuplicateRows();

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when no duplicates exist", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("")], [makeRow({ "": 0 }), makeRow({ "": 1 })]);
    setupWithDataSource(ds);
    const { isUndoable } = useDataSourceHistory();
    const deleteDuplicateRows = useDeleteDuplicateRows();
    deleteDuplicateRows();

    expect(isUndoable.value).toBe(false);
  });
});
