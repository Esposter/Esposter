import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { ColumnStats } from "@/models/tableEditor/file/column/ColumnStats";

import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { useTableEditorStore } from "@/store/tableEditor";

export const useColumnStats = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const { editedItem } = storeToRefs(tableEditorStore);
  return computed<ColumnStats[]>(() =>
    editedItem.value?.dataSource ? computeColumnStats(editedItem.value.dataSource) : [],
  );
};
