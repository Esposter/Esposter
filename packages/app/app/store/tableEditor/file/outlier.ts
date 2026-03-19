import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/tableEditor/file/constants";
import { getCellId } from "@/services/tableEditor/file/getCellId";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";

export const useOutlierStore = defineStore("tableEditor/file/outlier", () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const isOutlierHighlightEnabled = ref(false);
  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value || !tableEditorStore.editedItem?.dataSource) return new Set();
    const dataSource = tableEditorStore.editedItem.dataSource;
    const result = new Set<string>();
    for (const { columnType, average, standardDeviation, columnName } of computeColumnStats(dataSource)) {
      if (
        columnType !== ColumnType.Number ||
        average === null ||
        standardDeviation === null ||
        standardDeviation === 0
      )
        continue;
      const threshold = OUTLIER_STANDARD_DEVIATION_MULTIPLIER * standardDeviation;
      for (const row of dataSource.rows) {
        const value = takeOne(row.data, columnName);
        if (typeof value === "number" && Math.abs(value - average) > threshold)
          result.add(getCellId(row.id, columnName));
      }
    }
    return result;
  });
  return { isOutlierHighlightEnabled, outlierCells };
});
