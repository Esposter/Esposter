import { Column } from "#shared/models/tableEditor/file/Column";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("toggleColumnVisibility", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("hides a visible column", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { toggleColumnVisibility } = operations;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
  });

  test("shows a hidden column", () => {
    expect.hasAssertions();

    const hiddenColumn = new Column({ hidden: true, name: "" });
    const { editedItem, operations } = setupWithDataSource(makeDataSource([hiddenColumn], [makeRow({ "": 0 })]));
    const { toggleColumnVisibility } = operations;
    toggleColumnVisibility(hiddenColumn.id);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
  });

  test("undo restores original visibility", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { toggleColumnVisibility, undo } = operations;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    undo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
  });

  test("redo re-applies toggle after undo", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { redo, toggleColumnVisibility, undo } = operations;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    undo();
    redo();
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
  });

  test("no-op when column id not found", () => {
    expect.hasAssertions();

    const { operations } = setupWithDataSource();
    const { isUndoable, toggleColumnVisibility } = operations;
    toggleColumnVisibility("nonexistent");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { isUndoable, toggleColumnVisibility } = useEditedItemDataSourceOperations();
    toggleColumnVisibility("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const { isUndoable, toggleColumnVisibility } = useEditedItemDataSourceOperations();
    toggleColumnVisibility("");

    expect(isUndoable.value).toBe(false);
  });
});
