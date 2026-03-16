import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { expectToBeDefined } from "#shared/test/expectToBeDefined";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  makeDataSource,
  setupEditedItem,
  setupWithDataSource,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils.test";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia, storeToRefs } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("setDataSource", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("sets data source on edited item", () => {
    expect.hasAssertions();

    const { editedItem } = setupEditedItem();
    const { setDataSource } = useEditedItemDataSourceOperations();
    const dataSource = makeDataSource();
    setDataSource(dataSource);
    const editedItemValue = editedItem.value;

    expectToBeDefined(editedItemValue);

    expect(editedItemValue.dataSource).toStrictEqual(dataSource);
  });

  test("clears history after setting data source", () => {
    expect.hasAssertions();

    const { editedItem, operations } = setupWithDataSource();
    const { deleteRow, isUndoable, setDataSource } = operations;
    deleteRow(takeOne(editedItem.value?.dataSource?.rows ?? [], 0).id);

    expect(isUndoable.value).toBe(true);

    setDataSource(makeDataSource());

    expect(isUndoable.value).toBe(false);
  });

  test("no-op when editedItem is undefined", () => {
    expect.hasAssertions();

    const { setDataSource } = useEditedItemDataSourceOperations();
    setDataSource(makeDataSource());

    const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
    const { editedItem } = storeToRefs(tableEditorStore);

    expect(editedItem.value).toBeUndefined();
  });
});
