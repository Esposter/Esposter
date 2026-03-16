import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { useEditedItemDataSourceOperations } from "@/composables/tableEditor/file/useEditedItemDataSourceOperations";
import {
  makeColumn,
  makeDataSource,
  makeRow,
  useDataSourceHistory,
} from "@/composables/tableEditor/file/useEditedItemDataSourceOperations/testUtils";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia, storeToRefs } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe("history clears when editedItem.id changes", () => {
  beforeEach(() => {
    const { clear } = useDataSourceHistory();
    setActivePinia(createPinia());
    clear();
  });

  test("history is cleared when editedItem changes to a different item", async () => {
    expect.hasAssertions();

    const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
    const { editedItem } = storeToRefs(tableEditorStore);
    const itemStore = useItemStore();
    const { createItem } = itemStore;
    const item1 = new CsvDataSourceItem();
    const item2 = new CsvDataSourceItem();
    createItem(item1);
    createItem(item2);
    editedItem.value = item1;
    const operations = useEditedItemDataSourceOperations();
    const { deleteRow, isUndoable, setDataSource } = operations;
    setDataSource(makeDataSource([makeColumn("")], [makeRow({ "": 0 }), makeRow({ "": 1 })]));
    deleteRow(takeOne(editedItem.value.dataSource?.rows ?? [], 0).id);

    expect(isUndoable.value).toBe(true);

    editedItem.value = item2;
    await nextTick();

    expect(isUndoable.value).toBe(false);
  });
});
