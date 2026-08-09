import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { computeValue } from "@/services/resource/sheet/column/computeValue";
import { getEffectiveColumnType } from "@/services/resource/sheet/column/getEffectiveColumnType";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/resource/sheet/constants";
import { getItemId } from "@/services/resource/sheet/getItemId";
import { useSheetStore } from "@/store/resource/sheet";

export const useOutlierStore = defineStore("resource/sheet/outlier", () => {
  const sheetStore = useSheetStore();
  const isOutlierHighlightEnabled = ref(false);
  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value) return new Set();
    const { dataSource } = sheetStore;
    const result = new Set<string>();
    // Effective type and the resolver, so a computed column producing numbers is highlighted on the same terms
    // As one storing them — it is the values on screen a reader compares against the mean
    const numberColumns = dataSource.columns.filter((column) => getEffectiveColumnType(column) === ColumnType.Number);
    for (const column of numberColumns) {
      const { average, standardDeviation } = computeColumnStatisticsForColumn(dataSource, column);
      if (average === undefined || standardDeviation === undefined || standardDeviation <= 0) continue;
      const threshold = OUTLIER_STANDARD_DEVIATION_MULTIPLIER * standardDeviation;
      for (const [rowIndex, row] of dataSource.rows.entries()) {
        const value = computeValue(dataSource.rows, row, dataSource.columns, column, rowIndex);
        if (typeof value === "number" && Math.abs(value - average) > threshold)
          result.add(getItemId(row.id, column.name));
      }
    }
    return result;
  });
  return { isOutlierHighlightEnabled, outlierCells };
});
