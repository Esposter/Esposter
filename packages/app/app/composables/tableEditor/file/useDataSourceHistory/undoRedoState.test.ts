import { expectToBeDefined, takeOne } from "@esposter/shared";
import { setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("isUndoable and isRedoable state transitions", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("initially not undoable and not redoable", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const { isRedoable, isUndoable } = useDataSourceHistory();

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes undoable after an operation", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { isRedoable, isUndoable } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { isRedoable, isUndoable, undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(true);
  });

  test("undo no-op when history is empty", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const { isUndoable, undo } = useDataSourceHistory();
    const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isUndoable.value).toBe(false);
  });

  test("redo no-op when future is empty", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const { isRedoable, redo } = useDataSourceHistory();
    const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isRedoable.value).toBe(false);
  });

  test("new operation after undo clears redo history", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { isRedoable, undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);

    expect(isRedoable.value).toBe(true);

    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isRedoable.value).toBe(false);
  });
});
