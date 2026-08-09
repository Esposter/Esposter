import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/resource/sheet/constants";
import { getItemId } from "@/services/resource/sheet/getItemId";
import { useSheetStore } from "@/store/resource/sheet";
import { takeOne } from "@esposter/shared";

export const useOutlierStore = defineStore("resource/sheet/outlier", () => {
  const sheetStore = useSheetStore();
  const isOutlierHighlightEnabled = ref(false);
  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value) return new Set();
    const { dataSource } = sheetStore;
    const result = new Set<string>();
    for (const column of dataSource.columns.filter(({ type }) => type === ColumnType.Number)) {
      const { average, standardDeviation } = computeColumnStatisticsForColumn(dataSource, column);
      if (average === undefined || standardDeviation === undefined || standardDeviation <= 0) continue;
      const threshold = OUTLIER_STANDARD_DEVIATION_MULTIPLIER * standardDeviation;
      for (const row of dataSource.rows) {
        const value = takeOne(row.data, column.name);
        if (typeof value === "number" && Math.abs(value - average) > threshold)
          result.add(getItemId(row.id, column.name));
      }
    }
    return result;
  });
  return { isOutlierHighlightEnabled, outlierCells };
});
