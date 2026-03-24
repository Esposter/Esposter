import { Column } from "#shared/models/tableEditor/file/column/Column";
import {
  makeDataSource,
  makeRow,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useToggleColumnVisibility, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("hides a visible column", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
  });

  test("shows a hidden column", () => {
    expect.hasAssertions();

    const hiddenColumn = new Column({ hidden: true, name: "" });
    const { editedItem } = setupWithDataSource(makeDataSource([hiddenColumn], [makeRow({ "": 0 })]));
    const toggleColumnVisibility = useToggleColumnVisibility();
    toggleColumnVisibility(hiddenColumn.id);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
  });

  test("undo restores original visibility", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(false);
  });

  test("redo re-applies toggle after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnVisibility(column.id);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).hidden).toBe(true);
  });

  test("no-op when column id not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    toggleColumnVisibility("-1");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    toggleColumnVisibility("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const toggleColumnVisibility = useToggleColumnVisibility();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    toggleColumnVisibility("");

    expect(isUndoable.value).toBe(false);
  });
});
