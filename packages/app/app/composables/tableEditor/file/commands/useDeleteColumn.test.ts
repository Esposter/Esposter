import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared"
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useDeleteColumn, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("removes column by name", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    deleteColumn("");
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.columns, 0).name).toBe(" ");
    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
  });

  test("undo restores deleted column and row values", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    const { undo } = useDataSourceHistory();
    deleteColumn("");
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("");
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies delete after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    const { redo, undo } = useDataSourceHistory();
    deleteColumn("");
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
  });

  test("undo preserves row.data key order after restore", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("a"), makeColumn("b"), makeColumn("c")], [makeRow({ a: 1, b: 2, c: 3 })]);
    const { editedItem } = setupWithDataSource(ds);
    const deleteColumn = useDeleteColumn();
    const { undo } = useDataSourceHistory();
    deleteColumn("b");
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("no-op when column name not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    const { isUndoable } = useDataSourceHistory();
    deleteColumn("-1");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const deleteColumn = useDeleteColumn();
    const { isUndoable } = useDataSourceHistory();
    deleteColumn("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const deleteColumn = useDeleteColumn();
    const { isUndoable } = useDataSourceHistory();
    deleteColumn("");

    expect(isUndoable.value).toBe(false);
  });
});
