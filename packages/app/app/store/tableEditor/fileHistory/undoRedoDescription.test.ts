// @vitest-environment nuxt
import { setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
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

  test("undoDescription is empty when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);

    expect(undoDescription.value).toBe("");
  });

  test("undoDescription reflects last command", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? []).id);

    expect(undoDescription.value).toBe("Delete Row 1");
  });

  test("redoDescription is empty when no future", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { redoDescription } = storeToRefs(fileHistoryStore);

    expect(redoDescription.value).toBe("");
  });

  test("redoDescription reflects undone command", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { redoDescription } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? []).id);
    undo(editedItem.value);

    expect(redoDescription.value).toBe("Delete Row 1");
  });
});
