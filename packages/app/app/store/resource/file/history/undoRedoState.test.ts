// @vitest-environment nuxt
import { setupWithDataSource } from "@/composables/resource/file/commands/setupWithDataSource.test";
import { useFileHistoryStore } from "@/store/resource/file/history";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(useFileHistoryStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
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

  test("becomes undoable after an operation", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(fileHistoryStore);
    await deleteRow(takeOne(dataSource?.rows ?? []).id);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(true);
  });

  test("undo no-op when history is empty", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    const rowCountBefore = dataSource?.rows.length ?? 0;
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isUndoable.value).toBe(false);
  });

  test("redo no-op when future is empty", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable } = storeToRefs(fileHistoryStore);
    const { redo } = fileHistoryStore;
    const rowCountBefore = dataSource?.rows.length ?? 0;
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isRedoable.value).toBe(false);
  });

  test("new operation after undo clears redo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isRedoable } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    await deleteRow(takeOne(dataSource?.rows ?? []).id);

    expect(isRedoable.value).toBe(false);
  });
});
