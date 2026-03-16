import { Column } from "#shared/models/tableEditor/file/Column";
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

describe(useReorderColumns, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("moves column forward (index 0 to 1)", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns, 0)] as Column[];
    reorderColumns(newColumns);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe(" ");
    expect(takeOne(dataSource.columns, 1).name).toBe("");
  });

  test("undo restores original column order", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const { undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns, 0)] as Column[];
    reorderColumns(newColumns);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("");
    expect(takeOne(dataSource.columns, 1).name).toBe(" ");
  });

  test("redo re-applies reorder after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const { redo, undo } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns, 0)] as Column[];
    reorderColumns(newColumns);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe(" ");
    expect(takeOne(dataSource.columns, 1).name).toBe("");
  });

  test("moves column backward (index 1 to 0) with three columns", () => {
    expect.hasAssertions();

    const threeColumnDs = makeDataSource(
      [makeColumn("a"), makeColumn("b"), makeColumn("c")],
      [makeRow({ a: 0, b: 1, c: 2 })],
    );
    const { editedItem } = setupWithDataSource(threeColumnDs);
    const reorderColumns = useReorderColumns();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns, 0), takeOne(columns, 2)] as Column[];
    reorderColumns(newColumns);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("b");
    expect(takeOne(dataSource.columns, 1).name).toBe("a");
    expect(takeOne(dataSource.columns, 2).name).toBe("c");
  });

  test("moves column forward non-adjacent (index 0 to 2) with three columns", () => {
    expect.hasAssertions();

    const threeColumnDs = makeDataSource(
      [makeColumn("a"), makeColumn("b"), makeColumn("c")],
      [makeRow({ a: 0, b: 1, c: 2 })],
    );
    const { editedItem } = setupWithDataSource(threeColumnDs);
    const reorderColumns = useReorderColumns();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    const newColumns = [takeOne(columns, 1), takeOne(columns, 2), takeOne(columns, 0)] as Column[];
    reorderColumns(newColumns);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).name).toBe("b");
    expect(takeOne(dataSource.columns, 1).name).toBe("c");
    expect(takeOne(dataSource.columns, 2).name).toBe("a");
  });

  test("no-op when order unchanged", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const reorderColumns = useReorderColumns();
    const { isUndoable } = useDataSourceHistory();
    const columns = editedItem.value?.dataSource?.columns ?? [];
    reorderColumns([...columns]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const reorderColumns = useReorderColumns();
    const { isUndoable } = useDataSourceHistory();
    reorderColumns([]);

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const reorderColumns = useReorderColumns();
    const { isUndoable } = useDataSourceHistory();
    reorderColumns([]);

    expect(isUndoable.value).toBe(false);
  });
});
