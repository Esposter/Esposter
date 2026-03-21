import { setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useFileHistoryStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("undoDescription is null when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);

    expect(undoDescription.value).toBeNull();
  });

  test("undoDescription reflects last command", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { undoDescription } = storeToRefs(fileHistoryStore);
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(undoDescription.value).toMatchInlineSnapshot(`"Delete Row 1"`);
  });

  test("redoDescription is null when no future", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const fileHistoryStore = useFileHistoryStore();
    const { redoDescription } = storeToRefs(fileHistoryStore);

    expect(redoDescription.value).toBeNull();
  });

  test("redoDescription reflects undone command", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { redoDescription } = storeToRefs(fileHistoryStore);
    const { undo } = fileHistoryStore;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);

    expect(redoDescription.value).toMatchInlineSnapshot(`"Delete Row 1"`);
  });
});
