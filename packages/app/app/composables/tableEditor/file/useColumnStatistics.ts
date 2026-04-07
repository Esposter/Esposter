import type { ColumnStatistics } from "#shared/models/tableEditor/file/column/ColumnStatistics";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { computeColumnStatistics } from "@/services/tableEditor/file/column/computeColumnStatistics";
import { useTableEditorStore } from "@/store/tableEditor";

export const useColumnStatistics = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  return computed<ColumnStatistics[]>(() =>
    editedItem.value?.dataSource ? computeColumnStatistics(editedItem.value.dataSource) : [],
  );
};
