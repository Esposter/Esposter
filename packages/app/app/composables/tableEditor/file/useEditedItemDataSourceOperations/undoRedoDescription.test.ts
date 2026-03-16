import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupWithDataSource,
  useDataSourceHistory,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("undoDescription and redoDescription", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("undoDescription is null when no history", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const { undoDescription } = useEditedItemDataSourceOperations();

    expect(undoDescription.value).toBeNull();
  });

  test("undoDescription reflects last command", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, undoDescription } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expectToBeDefined(undoDescription.value);

    expect(undoDescription.value).toContain("Delete");
  });

  test("redoDescription is null when no future", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const { redoDescription } = useEditedItemDataSourceOperations();

    expect(redoDescription.value).toBeNull();
  });

  test("redoDescription reflects undone command", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, redoDescription, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo();

    expectToBeDefined(redoDescription.value);

    expect(redoDescription.value).toContain("Delete");
  });
});
