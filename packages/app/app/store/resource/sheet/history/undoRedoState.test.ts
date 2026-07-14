// @vitest-environment nuxt
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(useSheetHistoryStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const sheetHistoryStore = useSheetHistoryStore();
    const { clear } = sheetHistoryStore;
    clear();
  });

  test("initially not undoable and not redoable", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes undoable after an operation", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
    await deleteRow(takeOne(dataSource?.rows ?? []).id);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(true);
  });

  test("undo no-op when history is empty", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    const rowCountBefore = dataSource?.rows.length ?? 0;
    undo(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isUndoable.value).toBe(false);
  });

  test("redo no-op when future is empty", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable } = storeToRefs(sheetHistoryStore);
    const { redo } = sheetHistoryStore;
    const rowCountBefore = dataSource?.rows.length ?? 0;
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isRedoable.value).toBe(false);
  });

  test("new operation after undo clears redo history", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    await deleteRow(takeOne(dataSource?.rows ?? []).id);

    expect(isRedoable.value).toBe(false);
  });
});
