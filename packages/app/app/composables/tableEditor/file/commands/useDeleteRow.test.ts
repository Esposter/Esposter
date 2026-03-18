import { expectToBeDefined, takeOne } from "@esposter/shared";
import { setupEditedItem, setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useDeleteRow, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("removes row at given index", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
  });

  test("undo restores deleted row", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(0);
  });

  test("redo re-applies delete after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { redo, undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows, 0).data[""]).toBe(2);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const deleteRow = useDeleteRow();
    const { isUndoable } = useDataSourceHistory();
    deleteRow("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const deleteRow = useDeleteRow();
    const { isUndoable } = useDataSourceHistory();
    deleteRow("");

    expect(isUndoable.value).toBe(false);
  });
});
