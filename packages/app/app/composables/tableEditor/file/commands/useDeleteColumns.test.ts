import { expectToBeDefined, takeOne } from "@esposter/shared";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useDeleteColumns, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("removes all specified columns by id", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 0).id, takeOne(columns, 1).id]);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(0);
  });

  test("removes only the specified column", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 0).id]);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(1);
    expect(takeOne(dataSource.columns, 0).name).toBe(" ");
  });

  test("also removes the column data from all rows", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 0).id]);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBeUndefined();
    expect(takeOne(dataSource.rows, 1).data[""]).toBeUndefined();
  });

  test("undo restores all deleted columns at their original positions", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const { undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 0).id, takeOne(columns, 1).id]);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(2);
    expect(takeOne(dataSource.columns, 0).name).toBe("");
    expect(takeOne(dataSource.columns, 1).name).toBe(" ");
  });

  test("undo restores row data for deleted columns", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const { undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 0).id]);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 1).data[""]).toBe(2);
  });

  test("redo re-applies the bulk delete after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const { redo, undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 0).id, takeOne(columns, 1).id]);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.columns).toHaveLength(0);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const deleteColumns = useDeleteColumns();
    const { isUndoable } = useDataSourceHistory();
    deleteColumns(["-1"]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const deleteColumns = useDeleteColumns();
    const { isUndoable } = useDataSourceHistory();
    deleteColumns(["-1"]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when ids array is empty", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const { isUndoable } = useDataSourceHistory();
    deleteColumns([]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when no id matches a column", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const deleteColumns = useDeleteColumns();
    const { isUndoable } = useDataSourceHistory();
    deleteColumns(["-1"]);

    expect(isUndoable.value).toBe(false);
  });

  test("undo preserves row.data key order matching restored column order", () => {
    expect.hasAssertions();

    const ds = makeDataSource([makeColumn("a"), makeColumn("b"), makeColumn("c")], [makeRow({ a: 1, b: 2, c: 3 })]);
    const { editedItem } = setupWithDataSource(ds);
    const deleteColumns = useDeleteColumns();
    const { undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 1).id]);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual(["a", "b", "c"]);
  });

  test("undo preserves row.data key order when restoring multiple deleted columns", () => {
    expect.hasAssertions();

    const ds = makeDataSource(
      [makeColumn("a"), makeColumn("b"), makeColumn("c"), makeColumn("d")],
      [makeRow({ a: 1, b: 2, c: 3, d: 4 })],
    );
    const { editedItem } = setupWithDataSource(ds);
    const deleteColumns = useDeleteColumns();
    const { undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    deleteColumns([takeOne(columns, 1).id, takeOne(columns, 3).id]);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(Object.keys(takeOne(dataSource.rows, 0).data)).toStrictEqual(["a", "b", "c", "d"]);
  });
});
