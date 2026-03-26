import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/tableEditor/file/constants";
import { getItemId } from "@/services/tableEditor/file/getItemId";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";

export const useOutlierStore = defineStore("tableEditor/file/outlier", () => {
  const tableEditorStore = useTableEditorStore<DataSourceItem>();
  const isOutlierHighlightEnabled = ref(false);
  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value || !tableEditorStore.editedItem?.dataSource) return new Set();
    const dataSource = tableEditorStore.editedItem.dataSource;
    const result = new Set<string>();
    for (const { average, columnName, columnType, standardDeviation } of computeColumnStats(dataSource)) {
      if (columnType !== ColumnType.Number || average === null || standardDeviation === null || standardDeviation <= 0)
        continue;
      const threshold = OUTLIER_STANDARD_DEVIATION_MULTIPLIER * standardDeviation;
      for (const row of dataSource.rows) {
        const value = takeOne(row.data, columnName);
        if (typeof value === "number" && Math.abs(value - average) > threshold)
          result.add(getItemId(row.id, columnName));
      }
    }
    return result;
  });
  return { isOutlierHighlightEnabled, outlierCells };
});
