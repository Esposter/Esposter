import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, assert, beforeEach, describe, expect, test } from "vitest";

describe(useDeleteColumn, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
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
    expect(takeOne(dataSource.columns).name).toBe(" ");
    expect(takeOne(dataSource.rows).data[""]).toBeUndefined();
  });

  test("undo restores deleted column and row values", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    deleteColumn("");
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns).name).toBe("");
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies delete after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    deleteColumn("");
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBeUndefined();
  });

  test("undo preserves row.data key order after restore", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("a"), makeColumn("b"), makeColumn("c")], [makeRow({ a: 1, b: 2, c: 3 })]);
    const { editedItem } = setupWithDataSource(ds);
    const deleteColumn = useDeleteColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    deleteColumn("b");
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(Object.keys(takeOne(dataSource.rows).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("no-op when column name not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const deleteColumn = useDeleteColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    deleteColumn("-1");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const deleteColumn = useDeleteColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    deleteColumn("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const deleteColumn = useDeleteColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    deleteColumn("");

    expect(isUndoable.value).toBe(false);
  });
});
