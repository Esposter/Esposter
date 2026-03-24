import { ColumnTransformationType } from "#shared/models/tableEditor/file/ColumnTransformationType";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { ComputedColumn } from "#shared/models/tableEditor/file/ComputedColumn";
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

describe(useCreateComputedColumn, () => {
  const SOURCE_COLUMN_NAME = "";

  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("adds a computed column to the data source", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createComputedColumn = useCreateComputedColumn();
    const newColumn = new ComputedColumn({
      name: " ",
      sourceColumnId: sourceColumn.id,
      transformation: { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.String },
    });
    createComputedColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 1)).toBeInstanceOf(ComputedColumn);
  });

  test("does not write to row.data for computed column", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createComputedColumn = useCreateComputedColumn();
    const newColumn = new ComputedColumn({
      name: " ",
      sourceColumnId: sourceColumn.id,
      transformation: { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.String },
    });
    createComputedColumn(newColumn);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual([SOURCE_COLUMN_NAME]);
  });

  test("undo removes the computed column", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createComputedColumn = useCreateComputedColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const newColumn = new ComputedColumn({
      name: " ",
      sourceColumnId: sourceColumn.id,
      transformation: { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.String },
    });
    createComputedColumn(newColumn);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(1);
  });

  test("redo re-adds the computed column after undo", () => {
    expect.hasAssertions();

    const sourceColumn = makeColumn(SOURCE_COLUMN_NAME);
    const { editedItem } = setupWithDataSource(makeDataSource([sourceColumn], [makeRow({ [SOURCE_COLUMN_NAME]: 0 })]));
    const createComputedColumn = useCreateComputedColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const newColumn = new ComputedColumn({
      name: " ",
      sourceColumnId: sourceColumn.id,
      transformation: { type: ColumnTransformationType.ConvertTo, targetType: ColumnType.String },
    });
    createComputedColumn(newColumn);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.columns).toHaveLength(2);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const createComputedColumn = useCreateComputedColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const newColumn = new ComputedColumn({ name: " " });
    createComputedColumn(newColumn);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const createComputedColumn = useCreateComputedColumn();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    const newColumn = new ComputedColumn({ name: " " });
    createComputedColumn(newColumn);

    expect(isUndoable.value).toBe(false);
  });
});
