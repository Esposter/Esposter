// @vitest-environment nuxt
import { setupCommandTest } from "#src/composables/resource/sheet/commands/setupCommandTest.test";
import { setupWithDataSource } from "#src/composables/resource/sheet/commands/setupWithDataSource.test";
import { MAX_HISTORY_SIZE } from "#src/services/resource/sheet/constants";
import { useSheetHistoryStore } from "#src/store/resource/sheet/history/index";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const setupWithDeletedRow = (index = 0) => {
  const { dataSource } = setupWithDataSource();
  const deleteRow = useDeleteRow();
  deleteRow(takeOne(dataSource.rows, index).id);
  return { dataSource, deleteRow };
};

describe(useSheetHistoryStore, () => {
  setupCommandTest();

  test("becomes undoable after an operation", () => {
    expect.hasAssertions();

    setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable } = storeToRefs(sheetHistoryStore);

    expect(isUndoable.value).toBe(true);
    expect(isRedoable.value).toBe(false);
  });

  test("becomes redoable after undo", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDeletedRow();
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

  test("new operation after undo clears redo history", () => {
    expect.hasAssertions();

    const { dataSource, deleteRow } = setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    undo(dataSource);

    expect(isRedoable.value).toBe(true);

    deleteRow(takeOne(dataSource.rows).id);

    expect(isRedoable.value).toBe(false);
  });

  test("undoDescription is empty when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);

    expect(undoDescription.value).toBe("");
  });

  test("undoDescription reflects last command", () => {
    expect.hasAssertions();

    setupWithDeletedRow();
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

  test("redoDescription reflects undone command", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redoDescription } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    undo(dataSource);

    expect(redoDescription.value).toBe("Delete Row 1");
  });

  test("multiple undo operations reverse in order", () => {
    expect.hasAssertions();

    const { dataSource, deleteRow } = setupWithDeletedRow(1);
    const sheetHistoryStore = useSheetHistoryStore();
    const { undo } = sheetHistoryStore;
    deleteRow(takeOne(dataSource.rows).id);

    expect(dataSource.rows).toStrictEqual([]);

    undo(dataSource);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([{ "": 0, " ": 1 }]);

    undo(dataSource);

    expect(dataSource.rows.map(({ data }) => data)).toStrictEqual([
      { "": 0, " ": 1 },
      { "": 2, " ": 3 },
    ]);
  });

  test("mixed operations undo/redo correctly", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDeletedRow();
    const deleteColumns = useDeleteColumns();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redo, undo } = sheetHistoryStore;
    deleteColumns([takeOne(dataSource.columns, 1).id]);

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

  test("undoes only the MAX_HISTORY_SIZE most recent commands", () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const createRow = useCreateRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isUndoable } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    const rowCountBefore = dataSource.rows.length;
    for (let index = 0; index < MAX_HISTORY_SIZE + 1; index++) createRow();
    const undoableBeforeEachUndo: boolean[] = [];
    for (let index = 0; index < MAX_HISTORY_SIZE; index++) {
      undoableBeforeEachUndo.push(isUndoable.value);
      undo(dataSource);
    }

    expect(undoableBeforeEachUndo).toStrictEqual(Array.from({ length: MAX_HISTORY_SIZE }, () => true));
    expect(isUndoable.value).toBe(false);
    expect(dataSource.rows).toHaveLength(rowCountBefore + 1);
  });

  test("clear resets undo and redo state", () => {
    expect.hasAssertions();

    const { dataSource, deleteRow } = setupWithDeletedRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { isRedoable, isUndoable, redoDescription, undoDescription } = storeToRefs(sheetHistoryStore);
    const { clear, undo } = sheetHistoryStore;
    deleteRow(takeOne(dataSource.rows).id);
    undo(dataSource);
    clear();

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
    expect(undoDescription.value).toBe("");
    expect(redoDescription.value).toBe("");
  });
});
