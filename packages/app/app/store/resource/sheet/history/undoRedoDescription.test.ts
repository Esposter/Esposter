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

  test("undoDescription is empty when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);

    expect(undoDescription.value).toBe("");
  });

  test("undoDescription reflects last command", async () => {
    expect.hasAssertions();

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { undoDescription } = storeToRefs(sheetHistoryStore);
    await deleteRow(takeOne(dataSource?.rows ?? []).id);

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

    const { dataSource } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const sheetHistoryStore = useSheetHistoryStore();
    const { redoDescription } = storeToRefs(sheetHistoryStore);
    const { undo } = sheetHistoryStore;
    await deleteRow(takeOne(dataSource?.rows ?? []).id);
    undo(dataSource);

    expect(redoDescription.value).toBe("Delete Row 1");
  });
});
