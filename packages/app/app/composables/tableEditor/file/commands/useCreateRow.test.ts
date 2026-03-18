import { Row } from "#shared/models/tableEditor/file/Row";
import { expectToBeDefined, takeOne } from "@esposter/shared";
import { setupEditedItem, setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useCreateRow, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("appends a new row with null values for all columns", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createRow = useCreateRow();
    createRow();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 2).data[""]).toBeNull();
    expect(takeOne(dataSource.rows, 2).data[" "]).toBeNull();
  });

  test("appends a pre-built row with provided data", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createRow = useCreateRow();
    createRow(new Row({ data: { "": 0, " ": 1 } }));
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(3);
    expect(takeOne(dataSource.rows, 2).data[""]).toBe(0);
    expect(takeOne(dataSource.rows, 2).data[" "]).toBe(1);
  });

  test("undo removes the created row", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createRow = useCreateRow();
    const { undo } = useDataSourceHistory();
    createRow();
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(2);
  });

  test("redo re-applies create after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createRow = useCreateRow();
    const { redo, undo } = useDataSourceHistory();
    createRow();
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(3);
  });

  test("creates a unique id when the same row instance is passed multiple times", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const createRow = useCreateRow();
    const row = new Row({ data: { "": 0, " ": 1 } });
    createRow(row);
    createRow(row);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    const firstRow = takeOne(dataSource.rows, 2);
    const secondRow = takeOne(dataSource.rows, 3);

    expect(dataSource.rows).toHaveLength(4);
    expect(firstRow.id).not.toBe(secondRow.id);
    expect(firstRow).toStrictEqual(
      Object.assign(secondRow, {
        createdAt: firstRow.createdAt,
        id: firstRow.id,
        updatedAt: firstRow.updatedAt,
      }),
    );
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const createRow = useCreateRow();
    const { isUndoable } = useDataSourceHistory();
    createRow();

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const createRow = useCreateRow();
    const { isUndoable } = useDataSourceHistory();
    createRow();

    expect(isUndoable.value).toBe(false);
  });
});
