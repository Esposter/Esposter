import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { computeColumnStats } from "@/services/tableEditor/file/column/computeColumnStats";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/tableEditor/file/constants";
import { getCellId } from "@/services/tableEditor/file/getCellId";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { takeOne } from "@esposter/shared";

export const useOutlierState = createSharedComposable(() => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileTableEditorStore = useFileTableEditorStore();
  const { isOutlierHighlightEnabled } = storeToRefs(fileTableEditorStore);

  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value || !editedItem.value?.dataSource) return new Set();

    const dataSource = editedItem.value.dataSource;
    const result = new Set<string>();

    for (const stats of computeColumnStats(dataSource)) {
      if (
        stats.columnType !== ColumnType.Number ||
        stats.average === null ||
        stats.standardDeviation === null ||
        stats.standardDeviation === 0
      )
        continue;

      const threshold = OUTLIER_STANDARD_DEVIATION_MULTIPLIER * stats.standardDeviation;

      for (const row of dataSource.rows) {
        const value = takeOne(row.data, stats.columnName);
        if (typeof value === "number" && Math.abs(value - stats.average) > threshold)
          result.add(getCellId(row.id, stats.columnName));
      }
    }

    return result;
  });

  return { isOutlierHighlightEnabled, outlierCells };
});
