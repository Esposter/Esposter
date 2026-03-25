import { Column } from "#shared/models/tableEditor/file/column/Column";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useCreateColumn, () => {
  const SOURCE_COLUMN_NAME = "";

  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("appends a new column with null values for all rows", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createColumn = useCreateColumn();
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(3);
    expect(takeOne(dataSource.columns, 2).name).toBe("new");
    expect(takeOne(dataSource.rows, 0).data.new).toBeNull();
    expect(takeOne(dataSource.rows, 1).data.new).toBeNull();
  });

  test("undo removes the created column and its row values", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createColumn = useCreateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data.new).toBeUndefined();
  });

  test("redo re-applies create after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createColumn = useCreateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(3);
    expect(takeOne(dataSource.rows, 0).data.new).toBeNull();
  });

  test("creates a unique id when the same column instance is passed multiple times", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createColumn = useCreateColumn();
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);
    createColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

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

    const createColumn = useCreateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const createColumn = useCreateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const newColumn = new Column({ name: "new", sourceName: "new" });
    createColumn(newColumn);

    expect(isUndoable.value).toBe(false);
  });

  test("adds a computed column to the data source", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createColumn = useCreateColumn();
    const newColumn = new ComputedColumn({
      name: " ",
      transformation: {
        sourceColumnId: sourceColumn.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    createColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 1)).toBeInstanceOf(ComputedColumn);
  });

  test("does not write to row.data for computed column", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createColumn = useCreateColumn();
    const newColumn = new ComputedColumn({
      name: " ",
      transformation: {
        sourceColumnId: sourceColumn.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    createColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual([SOURCE_COLUMN_NAME]);
  });

  test("undo removes the computed column", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createColumn = useCreateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const newColumn = new ComputedColumn({
      name: " ",
      transformation: {
        sourceColumnId: sourceColumn.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    createColumn(newColumn);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(1);
  });

  test("redo re-adds the computed column after undo", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createColumn = useCreateColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const newColumn = new ComputedColumn({
      name: " ",
      transformation: {
        sourceColumnId: sourceColumn.id,
        targetType: ColumnType.String,
        type: ColumnTransformationType.ConvertTo,
      },
    });
    createColumn(newColumn);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
  });
});
