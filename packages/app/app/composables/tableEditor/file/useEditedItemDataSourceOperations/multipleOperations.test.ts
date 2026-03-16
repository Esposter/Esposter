import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import {
  setupWithDataSource,
  useDataSourceHistory,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("multiple sequential operations", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("multiple undo operations reverse in order", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 1).id);
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    const dataSourceAfterDeletes = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterDeletes);

    expect(dataSourceAfterDeletes.rows).toHaveLength(0);

    undo();
    const dataSourceAfterUndo1 = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo1);

    expect(dataSourceAfterUndo1.rows).toHaveLength(1);
    expect(takeOne(dataSourceAfterUndo1.rows, 0).data[""]).toBe(0);

    undo();
    const dataSourceAfterUndo2 = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo2);

    expect(dataSourceAfterUndo2.rows).toHaveLength(2);
    expect(takeOne(dataSourceAfterUndo2.rows, 0).data[""]).toBe(0);
    expect(takeOne(dataSourceAfterUndo2.rows, 1).data[""]).toBe(2);
  });

  test("mixed operations undo/redo correctly", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteColumn, deleteRow, redo, undo } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);
    deleteColumn(" ");
    const dataSourceAfterOps = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterOps);

    expect(dataSourceAfterOps.rows).toHaveLength(1);
    expect(dataSourceAfterOps.columns).toHaveLength(1);

    undo();
    const dataSourceAfterUndo1 = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo1);

    expect(dataSourceAfterUndo1.columns).toHaveLength(2);

    undo();
    const dataSourceAfterUndo2 = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterUndo2);

    expect(dataSourceAfterUndo2.rows).toHaveLength(2);

    redo();
    const dataSourceAfterRedo1 = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterRedo1);

    expect(dataSourceAfterRedo1.rows).toHaveLength(1);

    redo();
    const dataSourceAfterRedo2 = editedItem.value?.dataSource;

    expectToBeDefined(dataSourceAfterRedo2);

    expect(dataSourceAfterRedo2.columns).toHaveLength(1);
  });
});
