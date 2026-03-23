import { Column } from "#shared/models/tableEditor/file/Column";
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

describe(useToggleColumnPin, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("pins an unpinned column", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnPin = useToggleColumnPin();
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnPin(column.id);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).fixed).toBe(true);
  });

  test("unpins a pinned column", () => {
    expect.hasAssertions();

    const pinnedColumn = new Column({ fixed: true, name: "" });
    const { editedItem } = setupWithDataSource(makeDataSource([pinnedColumn], [makeRow({ "": 0 })]));
    const toggleColumnPin = useToggleColumnPin();
    toggleColumnPin(pinnedColumn.id);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).fixed).toBe(false);
  });

  test("undo restores original pin state", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnPin = useToggleColumnPin();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnPin(column.id);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).fixed).toBe(false);
  });

  test("redo re-applies pin after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const toggleColumnPin = useToggleColumnPin();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    const column = takeOne(editedItem.value?.dataSource?.columns ?? [], 0);
    toggleColumnPin(column.id);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(takeOne(dataSource.columns, 0).fixed).toBe(true);
  });

  test("no-op when column id not found", () => {
    expect.hasAssertions();

    setupWithDataSource();
    const toggleColumnPin = useToggleColumnPin();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    toggleColumnPin("-1");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const toggleColumnPin = useToggleColumnPin();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    toggleColumnPin("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const toggleColumnPin = useToggleColumnPin();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    toggleColumnPin("");

    expect(isUndoable.value).toBe(false);
  });
});
