import { setupEditedItem, setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared"
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useDeleteRows, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("removes all specified rows by id", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    deleteRows([takeOne(rows, 0).id, takeOne(rows, 1).id]);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(0);
  });

  test("removes only the specified rows", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    deleteRows([takeOne(rows, 0).id]);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
  });

  test("undo restores all deleted rows at their original positions", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const { undo } = useDataSourceHistory();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    deleteRows([takeOne(rows, 0).id, takeOne(rows, 1).id]);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies the bulk delete after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRows = useDeleteRows();
    const { redo, undo } = useDataSourceHistory();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    deleteRows([takeOne(rows, 0).id, takeOne(rows, 1).id]);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(0);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const deleteRows = useDeleteRows();
    const { isUndoable } = useDataSourceHistory();
    deleteRows(["-1"]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const deleteRows = useDeleteRows();
    const { isUndoable } = useDataSourceHistory();
    deleteRows(["-1"]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when ids array is empty", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const deleteRows = useDeleteRows();
    const { isUndoable } = useDataSourceHistory();
    deleteRows([]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when no id matches a row", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const deleteRows = useDeleteRows();
    const { isUndoable } = useDataSourceHistory();
    deleteRows(["-1"]);

    expect(isUndoable.value).toBe(false);
  });
});
