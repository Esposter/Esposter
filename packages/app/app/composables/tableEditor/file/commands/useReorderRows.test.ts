import { Row } from "#shared/models/tableEditor/file/Row";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useReorderRows, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("moves row forward (index 0 to 1)", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const reorderRows = useReorderRows();
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

    const { editedItem } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const { undo } = useDataSourceHistory();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
    reorderRows(newRows);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies reorder after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const { redo, undo } = useDataSourceHistory();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    const newRows = [takeOne(rows, 1), takeOne(rows, 0)] as Row[];
    reorderRows(newRows);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(0);
  });

  test("moves row backward (index 2 to 0) with three rows", () => {
    expect.hasAssertions();

    const threeRowDs = makeDataSource([makeColumn("")], [makeRow({ "": 0 }), makeRow({ "": 1 }), makeRow({ "": 2 })]);
    const { editedItem } = setupWithDataSource(threeRowDs);
    const reorderRows = useReorderRows();
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

    const { editedItem } = setupWithDataSource();
    const reorderRows = useReorderRows();
    const { isUndoable } = useDataSourceHistory();
    const rows = editedItem.value?.dataSource?.rows ?? [];
    reorderRows([...rows]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const reorderRows = useReorderRows();
    const { isUndoable } = useDataSourceHistory();
    reorderRows([]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const reorderRows = useReorderRows();
    const { isUndoable } = useDataSourceHistory();
    reorderRows([]);

    expect(isUndoable.value).toBe(false);
  });
});
