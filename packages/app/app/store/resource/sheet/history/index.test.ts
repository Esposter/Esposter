// @vitest-environment nuxt
import { setupCommandTest } from "@/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "@/composables/resource/sheet/commands/setupWithDataSource.test";
import { MAX_HISTORY_SIZE } from "@/services/resource/sheet/constants";
import { useSheetHistoryStore } from "@/store/resource/sheet/history";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(useSheetHistoryStore, () => {
  setupCommandTest();

  const setupWithDeletedRow = async (index = 0) => {
    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    await deleteRow(takeOne(dataSource.rows, index).id);
    return { dataSource, deleteRow };
  };

  test("becomes undoable after an operation", async () => {
    expect.hasAssertions();

    await setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", async () => {
    expect.hasAssertions();

    const { dataSource } = await setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
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
    const rowCountBefore = dataSource.rows.length;
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
    const rowCountBefore = dataSource.rows.length;
    redo(dataSource);

    expect(dataSource.rows).toHaveLength(rowCountBefore);
    expect(isRedoable.value).toBe(false);
  });

  test("new operation after undo clears redo history", async () => {
    expect.hasAssertions();

    const { dataSource, deleteRow } = await setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    await deleteRow(takeOne(dataSource.rows).id);

    expect(isRedoable.value).toBe(false);
  });

  test("undoDescription is empty when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);

    expect(undoDescription.value).toBe("");
  });

  test("undoDescription reflects last command", async () => {
    expect.hasAssertions();

    await setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);

    expect(undoDescription.value).toBe("Delete Row 1");
  });

  test("redoDescription is empty when no future", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redoDescription } = storeToRefs(sheetHistoryStore);

    expect(redoDescription.value).toBe("");
  });

  test("redoDescription reflects undone command", async () => {
    expect.hasAssertions();

    const { dataSource } = await setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redoDescription } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    undo(dataSource);

    expect(redoDescription.value).toBe("Delete Row 1");
  });

  test("multiple undo operations reverse in order", async () => {
    expect.hasAssertions();

    const { dataSource, deleteRow } = await setupWithDeletedRow(1);
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource.rows).id);

    expect(dataSource.rows).toHaveLength(0);

    undo(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);

    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("mixed operations undo/redo correctly", async () => {
    expect.hasAssertions();

    const { dataSource } = await setupWithDeletedRow();
    const deleteColumn = useDeleteColumn();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    await deleteColumn(" ");

    expect(dataSource.rows).toHaveLength(1);
    expect(dataSource.columns).toHaveLength(1);

    undo(dataSource);

    expect(dataSource.columns).toHaveLength(2);

    undo(dataSource);

    expect(dataSource.rows).toHaveLength(2);

    redo(dataSource);

    expect(dataSource.rows).toHaveLength(1);

    redo(dataSource);

    expect(dataSource.columns).toHaveLength(1);
  });

  test("undoes only the MAX_HISTORY_SIZE most recent commands", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    const rowCountBefore = dataSource.rows.length;
    for (let index = 0; index < MAX_HISTORY_SIZE + 1; index++) await createRow();
    const undoableBeforeEachUndo: boolean[] = [];
    for (let index = 0; index < MAX_HISTORY_SIZE; index++) {
      undoableBeforeEachUndo.push(isUndoable.value);
      undo(dataSource);
    }

    expect(undoableBeforeEachUndo).toStrictEqual(Array.from({ length: MAX_HISTORY_SIZE }, () => true));
    expect(isUndoable.value).toBe(false);
    expect(dataSource.rows).toHaveLength(rowCountBefore + 1);
  });

  test("clear resets undo and redo state", async () => {
    expect.hasAssertions();

    const { dataSource, deleteRow } = await setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable, redoDescription, undoDescription } = storeToRefs(sheetHistoryStore);
    const { clear, undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource.rows).id);
    undo(dataSource);
    clear();

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
    expect(undoDescription.value).toBe("");
    expect(redoDescription.value).toBe("");
  });
});
