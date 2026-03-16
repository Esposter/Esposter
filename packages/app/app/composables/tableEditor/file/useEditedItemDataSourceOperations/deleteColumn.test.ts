import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("deleteColumn", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("removes column by name", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteColumn } = operations;
    deleteColumn("");
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.columns, 0).name).toBe(" ");
    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
  });

  test("undo restores deleted column and row values", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteColumn, undo } = operations;
    deleteColumn("");
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("");
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies delete after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteColumn, redo, undo } = operations;
    deleteColumn("");
    undo();
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
  });

  test("no-op when column name not found", () => {
    expect.hasAssertions();

    const { operations } = setupWithDataSource();
    const { deleteColumn, isUndoable } = operations;
    deleteColumn("nonexistent");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { deleteColumn, isUndoable } = useEditedItemDataSourceOperations();
    deleteColumn("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { deleteColumn, isUndoable } = useEditedItemDataSourceOperations();
    deleteColumn("");

    expect(isUndoable.value).toBe(false);
  });
});
