import { setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useFileHistoryStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("initially not undoable and not redoable", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(fileHistoryStore);

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes undoable after an operation", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(fileHistoryStore);
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(true);
  });

  test("undo no-op when history is empty", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isUndoable.value).toBe(false);
  });

  test("redo no-op when future is empty", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable } = storeToRefs(fileHistoryStore);
    const { redo } = fileHistoryStore;
    const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isRedoable.value).toBe(false);
  });

  test("new operation after undo clears redo history", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);

    expect(isRedoable.value).toBe(true);

    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isRedoable.value).toBe(false);
  });
});
