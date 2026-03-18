import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import {
  makeDataSource,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/commands/testUtils.test";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared"
import { createPinia, setActivePinia } from "pinia";
import { assert, beforeEach, describe, expect, test } from "vitest";

describe(useSetDataSource, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const { clear } = useDataSourceHistory();
    clear();
  });

  test("sets data source on edited item", () => {
    expect.hasAssertions();

    const { editedItem } = setupEditedItem();
    const setDataSource = useSetDataSource();
    const dataSource = makeDataSource();
    setDataSource(dataSource);
    const editedItemValue = editedItem.value;

    assert.exists(editedItemValue);

    expect(editedItemValue.dataSource).toStrictEqual(dataSource);
  });

  test("clears undo and redo history after setting data source", () => {
    expect.hasAssertions();

    const { editedItem } = setupWithDataSource();
    const deleteRow = useDeleteRow();
    const setDataSource = useSetDataSource();
    const { isRedoable, isUndoable, undo } = useDataSourceHistory();
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isUndoable.value).toBe(true);

    undo(editedItem.value);

    expect(isRedoable.value).toBe(true);

    setDataSource(makeDataSource());

    expect(isUndoable.value).toBe(false);
    expect(isRedoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const setDataSource = useSetDataSource();
    setDataSource(makeDataSource());

    const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
    const { editedItem } = storeToRefs(tableEditorStore);

    expect(editedItem.value).toBeUndefined();
  });
});
