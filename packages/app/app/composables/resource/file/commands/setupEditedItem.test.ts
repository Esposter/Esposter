import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { CsvDataSourceItem } from "#shared/models/resource/file/csv/CsvDataSourceItem";
import { useFileStore } from "@/store/resource/file";
import { useItemStore } from "@/store/resource/file/item";
import { describe } from "vitest";

export const setupEditedItem = () => {
  const fileStore = useFileStore();
  const { dataSource } = storeToRefs(fileStore);
  const itemStore = useItemStore();
  const { createItem } = itemStore;
  const item = new CsvDataSourceItem();
  createItem(item);
  editedItem.value = item;
  return { editedItem, item };
};

describe.todo("setupEditedItem");
