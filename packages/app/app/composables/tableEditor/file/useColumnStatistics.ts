import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { ColumnStatistics } from "@/models/tableEditor/file/column/ColumnStatistics";

import { computeColumnStatistics } from "@/services/tableEditor/file/column/computeColumnStatistics";
import { useTableEditorStore } from "@/store/tableEditor";

export const useColumnStatistics = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  return computed<ColumnStatistics[]>(() =>
    editedItem.value?.dataSource ? computeColumnStatistics(editedItem.value.dataSource) : [],
  );
};
