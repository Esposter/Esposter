import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useEditedItemDataSourceOperations, () => {
  describe("deleteColumns", () => {
    beforeEach(() => {
      const { clear } = useDataSourceHistory();
      setActivePinia(createPinia());
      clear();
    });

    test("removes all specified columns by id", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumns } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      deleteColumns([takeOne(columns, 0).id, takeOne(columns, 1).id]);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(0);
    });

    test("removes only the specified column", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumns } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      deleteColumns([takeOne(columns, 0).id]);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(1);
      expect(takeOne(dataSource.columns, 0).name).toBe(" ");
    });

    test("also removes the column data from all rows", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumns } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      deleteColumns([takeOne(columns, 0).id]);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data).not.toHaveProperty("");
      expect(takeOne(dataSource.rows, 1).data).not.toHaveProperty("");
    });

    test("undo restores all deleted columns at their original positions", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumns, undo } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      deleteColumns([takeOne(columns, 0).id, takeOne(columns, 1).id]);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(2);
      expect(takeOne(dataSource.columns, 0).name).toBe("");
      expect(takeOne(dataSource.columns, 1).name).toBe(" ");
    });

    test("undo restores row data for deleted columns", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumns, undo } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      deleteColumns([takeOne(columns, 0).id]);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
    });

    test("redo re-applies the bulk delete after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteColumns, redo, undo } = operations;
      const columns = editedItem.value?.dataSource?.columns ?? [];
      deleteColumns([takeOne(columns, 0).id, takeOne(columns, 1).id]);
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.columns).toHaveLength(0);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { deleteColumns, isUndoable } = useEditedItemDataSourceOperations();
      deleteColumns(["some-id"]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { deleteColumns, isUndoable } = useEditedItemDataSourceOperations();
      deleteColumns(["some-id"]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when ids array is empty", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteColumns, isUndoable } = operations;
      deleteColumns([]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when no id matches a column", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteColumns, isUndoable } = operations;
      deleteColumns(["non-existent-id"]);

      expect(isUndoable.value).toBe(false);
    });
  });
});
