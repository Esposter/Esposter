import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useSetDataSource = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { clear } = fileHistoryStore;
  return (value: DataSource) => {
    if (!editedItem.value) return;
    editedItem.value.dataSource = value;
    clear();
  };
};
