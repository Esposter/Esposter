import { setupEditedItem, setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, assert, beforeEach, describe, expect, test } from "vitest";

describe(useDeleteRow, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    const fileHistoryStore = useFileHistoryStore();
    const { clear } = fileHistoryStore;
    clear();
  });

  test("removes row at given index", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? []).id);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("undo restores deleted row", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { undo } = fileHistoryStore;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? []).id);
    undo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(2);
    expect(takeOne(dataSource.rows).data[""]).toBe(0);
  });

  test("redo re-applies delete after undo", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { redo, undo } = fileHistoryStore;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? []).id);
    undo(editedItem.value);
    redo(editedItem.value);
    const dataSource = editedItem.value?.dataSource;

    assert.exists(dataSource);

    expect(dataSource.rows).toHaveLength(1);
    expect(takeOne(dataSource.rows).data[""]).toBe(2);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    deleteRow("");

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when dataSource is null", () => {
    expect.hasAssertions();

    setupEditedItem();
    const deleteRow = useDeleteRow();
    const fileHistoryStore = useFileHistoryStore();
    const { isUndoable } = storeToRefs(fileHistoryStore);
    deleteRow("");

    expect(isUndoable.value).toBe(false);
  });
});
