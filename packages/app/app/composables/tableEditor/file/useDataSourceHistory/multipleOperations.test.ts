import { setupWithDataSource } from "@/composables/tableEditor/file/commands/testUtils.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe("multiple sequential operations", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("multiple undo operations reverse in order", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const { undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 1).id);
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    const dataSourceAfterDeletes = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterDeletes);

    expect(dataSourceAfterDeletes.rows).toHaveLength(0);

    undo(editedItem.value);
    const dataSourceAfterUndo1 = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterUndo1);

    expect(dataSourceAfterUndo1.rows).toHaveLength(1);
    expect(takeOne(dataSourceAfterUndo1.rows, 0).data[""]).toBe(0);

    undo(editedItem.value);
    const dataSourceAfterUndo2 = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterUndo2);

    expect(dataSourceAfterUndo2.rows).toHaveLength(2);
    expect(takeOne(dataSourceAfterUndo2.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSourceAfterUndo2.rows, 1).data[""]).toBe(2);
  });

  test("mixed operations undo/redo correctly", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const deleteColumn = useDeleteColumn();
    const { redo, undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    deleteColumn(" ");
    const dataSourceAfterOps = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterOps);

    expect(dataSourceAfterOps.rows).toHaveLength(1);
    expect(dataSourceAfterOps.columns).toHaveLength(1);

    undo(editedItem.value);
    const dataSourceAfterUndo1 = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterUndo1);

    expect(dataSourceAfterUndo1.columns).toHaveLength(2);

    undo(editedItem.value);
    const dataSourceAfterUndo2 = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterUndo2);

    expect(dataSourceAfterUndo2.rows).toHaveLength(2);

    redo(editedItem.value);
    const dataSourceAfterRedo1 = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterRedo1);

    expect(dataSourceAfterRedo1.rows).toHaveLength(1);

    redo(editedItem.value);
    const dataSourceAfterRedo2 = editedItem.value?.dataSource;

    assert.exists(dataSourceAfterRedo2);

    expect(dataSourceAfterRedo2.columns).toHaveLength(1);
  });
});
