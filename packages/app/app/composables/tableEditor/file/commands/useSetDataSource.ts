import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { useTableEditorStore } from "@/store/tableEditor";

export const useSetDataSource = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { clear } = useDataSourceHistory();

  return (value: DataSource) => {
    if (!editedItem.value) return;
    editedItem.value.dataSource = value;
    clear();
  };
};
