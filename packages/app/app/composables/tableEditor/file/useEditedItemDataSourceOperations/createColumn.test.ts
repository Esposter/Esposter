import { Column } from "#shared/models/tableEditor/file/Column";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("createColumn", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("appends a new column with null values for all rows", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { createColumn } = operations;
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(3);
    expect(takeOne(dataSource.columns, 2).name).toBe("new");
    expect(takeOne(dataSource.rows, 0).data.new).toBeNull();
    expect(takeOne(dataSource.rows, 1).data.new).toBeNull();
  });

  test("undo removes the created column and its row values", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { createColumn, undo } = operations;
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data.new).toBeUndefined();
  });

  test("redo re-applies create after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { createColumn, redo, undo } = operations;
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    undo();
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(3);
    expect(takeOne(dataSource.rows, 0).data.new).toBeNull();
  });

  test("creates a unique id when the same column instance is passed multiple times", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { createColumn } = operations;
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    createColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    const firstColumn = takeOne(dataSource.columns, 2);
    const secondColumn = takeOne(dataSource.columns, 3);

    expect(dataSource.columns).toHaveLength(4);
    expect(firstColumn.id).not.toBe(secondColumn.id);
    expect(firstColumn).toStrictEqual(
      Object.assign(secondColumn, {
        createdAt: firstColumn.createdAt,
        id: firstColumn.id,
        updatedAt: firstColumn.updatedAt,
      }),
    );
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { createColumn, isUndoable } = useEditedItemDataSourceOperations();
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { createColumn, isUndoable } = useEditedItemDataSourceOperations();
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);

    expect(isUndoable.value).toBe(false);
  });
});
