import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { computeColumnStatistics } from "@/services/resource/file/column/computeColumnStatistics";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/resource/file/constants";
import { getItemId } from "@/services/resource/file/getItemId";
import { useFileStore } from "@/store/resource/file";
import { takeOne } from "@esposter/shared";

export const useOutlierStore = defineStore("resource/file/outlier", () => {
  const fileStore = useFileStore();
  const isOutlierHighlightEnabled = ref(false);
  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value) return new Set();
    const { dataSource } = fileStore;
    const result = new Set<string>();
    for (const { average, columnName, columnType, standardDeviation } of computeColumnStatistics(dataSource)) {
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
