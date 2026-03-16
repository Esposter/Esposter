import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupWithDataSource,
  useDataSourceHistory,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("isUndoable and isRedoable state transitions", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("initially not undoable and not redoable", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const { isRedoable, isUndoable } = useEditedItemDataSourceOperations();

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes undoable after an operation", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, isRedoable, isUndoable } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, isRedoable, isUndoable, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo();

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(true);
  });

  test("undo no-op when history is empty", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { isUndoable, undo } = operations;
    const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isUndoable.value).toBe(false);
  });

  test("redo no-op when future is empty", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { isRedoable, redo } = operations;
    const rowCountBefore = editedItem.value?.dataSource?.rows.length ?? 0;
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isRedoable.value).toBe(false);
  });

  test("new operation after undo clears redo history", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, isRedoable, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo();

    expect(isRedoable.value).toBe(true);

    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isRedoable.value).toBe(false);
  });
});
