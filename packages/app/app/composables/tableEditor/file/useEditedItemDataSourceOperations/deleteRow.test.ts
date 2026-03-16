import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupEditedItem,
  setupWithDataSource,
  useDataSourceHistory,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("deleteRow", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("removes row at given index", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
  });

  test("undo restores deleted row", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
  });

  test("redo re-applies delete after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, redo, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo();
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { deleteRow, isUndoable } = useEditedItemDataSourceOperations();
    deleteRow("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { deleteRow, isUndoable } = useEditedItemDataSourceOperations();
    deleteRow("");

    expect(isUndoable.value).toBe(false);
  });
});
