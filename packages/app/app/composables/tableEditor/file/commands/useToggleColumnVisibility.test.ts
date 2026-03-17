import { Column } from "#shared/models/tableEditor/file/Column";
import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import {
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useToggleColumnVisibility, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("hides a visible column", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
  });

  test("shows a hidden column", () => {
    expect.hasAssertions();

    const hiddenColumn = new Column({ hidden: true, name: "" });
    const { editedItem } = setupWithDataSource(makeDataSource([hiddenColumn], [makeRow({ "": 0 })]));
    const toggleColumnVisibility = useToggleColumnVisibility();
    toggleColumnVisibility(hiddenColumn.id);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
  });

  test("undo restores original visibility", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const { undo } = useDataSourceHistory();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
  });

  test("redo re-applies toggle after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const { redo, undo } = useDataSourceHistory();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    expectToBeDefined(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
  });

  test("no-op when column id not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const { isUndoable } = useDataSourceHistory();
    toggleColumnVisibility("-1");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const toggleColumnVisibility = useToggleColumnVisibility();
    const { isUndoable } = useDataSourceHistory();
    toggleColumnVisibility("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const { isUndoable } = useDataSourceHistory();
    toggleColumnVisibility("");

    expect(isUndoable.value).toBe(false);
  });
});
