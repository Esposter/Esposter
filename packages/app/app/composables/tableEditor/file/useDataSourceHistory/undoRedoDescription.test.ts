import { setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared"
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe("undoDescription and redoDescription", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("undoDescription is null when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const { undoDescription } = useDataSourceHistory();

    expect(undoDescription.value).toBeNull();
  });

  test("undoDescription reflects last command", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { undoDescription } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    assert.exists(undoDescription.value);

    expect(undoDescription.value).toContain("Delete");
  });

  test("redoDescription is null when no future", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const { redoDescription } = useDataSourceHistory();

    expect(redoDescription.value).toBeNull();
  });

  test("redoDescription reflects undone command", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { redoDescription, undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);

    assert.exists(redoDescription.value);

    expect(redoDescription.value).toContain("Delete");
  });
});
