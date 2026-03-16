import { Row } from "#shared/models/tableEditor/file/Row";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
  useDataSourceHistory,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("reorderRows", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("moves row forward (index 0 to 1)", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { reorderRows } = operations;
    const rows = editedItem.value?.dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
    reorderRows(newRows);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
  });

  test("undo restores original row order", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { reorderRows, undo } = operations;
    const rows = editedItem.value?.dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
    reorderRows(newRows);
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies reorder after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { redo, reorderRows, undo } = operations;
    const rows = editedItem.value?.dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
    reorderRows(newRows);
    undo();
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
  });

  test("moves row backward (index 2 to 0) with three rows", () => {
    expect.hasAssertions();

    const threeRowDs = makeDataSource([makeColumn("")], [makeRow({ "": 0 }), makeRow({ "": 1 }), makeRow({ "": 2 })]);
    const { editedItem, operations } = setupWithDataSource(threeRowDs);
    const { reorderRows } = operations;
    const rows = editedItem.value?.dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 2), takeOne(rows, 0), takeOne(rows, 1)] as Row[];
    reorderRows(newRows);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(1);
  });

  test("no-op when order unchanged", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { isUndoable, reorderRows } = operations;
    const rows = editedItem.value?.dataSource?.rows ?? [];
    reorderRows([...rows]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { isUndoable, reorderRows } = useEditedItemDataSourceOperations();
    reorderRows([]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { isUndoable, reorderRows } = useEditedItemDataSourceOperations();
    reorderRows([]);

    expect(isUndoable.value).toBe(false);
  });
});
