import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";
import { describe } from "vitest";

export const setupEditedItem = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const itemStore = useItemStore();
  const { createItem } = itemStore;
  const item = new CsvDataSourceItem();
  createItem(item);
  editedItem.value = item;
  return { editedItem, item };
};

describe.todo("setupEditedItem");
