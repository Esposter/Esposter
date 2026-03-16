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
  describe("deleteRows", () => {
    beforeEach(() => {
      const { clear } = useDataSourceHistory();
      setActivePinia(createPinia());
      clear();
    });

    test("removes all specified rows by id", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRows } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      deleteRows([takeOne(rows, 0).id, takeOne(rows, 1).id]);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(0);
    });

    test("removes only the specified rows", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRows } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      deleteRows([takeOne(rows, 0).id]);
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(1);
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    });

    test("undo restores all deleted rows at their original positions", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRows, undo } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      deleteRows([takeOne(rows, 0).id, takeOne(rows, 1).id]);
      undo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(2);
      expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
      expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
    });

    test("redo re-applies the bulk delete after undo", () => {
      expect.hasAssertions();

      const { editedItem, operations } = setupWithDataSource();
      const { deleteRows, redo, undo } = operations;
      const rows = editedItem.value?.dataSource?.rows ?? [];
      deleteRows([takeOne(rows, 0).id, takeOne(rows, 1).id]);
      undo();
      redo();
      const dataSource = editedItem.value?.dataSource;

      expectToBeDefined(dataSource);

      expect(dataSource.rows).toHaveLength(0);
    });

    test("no-op when editedItem is undefined", () => {
      expect.hasAssertions();

      const { deleteRows, isUndoable } = useEditedItemDataSourceOperations();
      deleteRows(["some-id"]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when dataSource is null", () => {
      expect.hasAssertions();

      setupEditedItem();
      const { deleteRows, isUndoable } = useEditedItemDataSourceOperations();
      deleteRows(["some-id"]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when ids array is empty", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRows, isUndoable } = operations;
      deleteRows([]);

      expect(isUndoable.value).toBe(false);
    });

    test("no-op when no id matches a row", () => {
      expect.hasAssertions();

      const { operations } = setupWithDataSource();
      const { deleteRows, isUndoable } = operations;
      deleteRows(["non-existent-id"]);

      expect(isUndoable.value).toBe(false);
    });
  });
});
