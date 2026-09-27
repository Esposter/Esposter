import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import type { AggregationTransformationReader } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationReader";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { computeValue } from "#shared/services/resource/sheet/column/computeValue";
import { getEffectiveColumnType } from "#shared/services/resource/sheet/column/getEffectiveColumnType";
import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { OUTLIER_STANDARD_DEVIATION_MULTIPLIER } from "@/services/resource/sheet/constants";
import { getItemId } from "@/services/resource/sheet/getItemId";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";

export const useOutlierStore = defineStore("resource/sheet/outlier", () => {
  const resourceStore = useResourceStore();
  const sheetStore = useSheetStore();
  const { data: isOutlierHighlightEnabled } = useDataMap(() => resourceStore.currentResourceId, false);
  const outlierCells = computed<Set<string>>(() => {
    if (!isOutlierHighlightEnabled.value) return new Set();
    const { dataSource } = sheetStore;
    const outlierCellIds = new Set<string>();
    // One pass over rows nothing edits mid-pass, so each aggregation walks its column once rather than once a cell
    const transformationReaderMap = new Map<AggregationTransformation, AggregationTransformationReader>();
    // Effective type and the resolver, so a computed column producing numbers is highlighted on the same terms
    // As one storing them — it is the values on screen a reader compares against the mean
    const numberColumns = dataSource.columns.filter((column) => getEffectiveColumnType(column) === ColumnType.Number);
    for (const column of numberColumns) {
      const { average, standardDeviation } = computeColumnStatisticsForColumn(
        dataSource,
        column,
        transformationReaderMap,
      );
      if (average === undefined || standardDeviation === undefined || standardDeviation <= 0) continue;
      const threshold = OUTLIER_STANDARD_DEVIATION_MULTIPLIER * standardDeviation;
      for (const [rowIndex, row] of dataSource.rows.entries()) {
        const value = computeValue(dataSource.rows, row, dataSource.columns, column, rowIndex, transformationReaderMap);
        if (typeof value === "number" && Math.abs(value - average) > threshold)
          outlierCellIds.add(getItemId(row.id, column.name));
      }
    }
    return outlierCellIds;
  });
  return { isOutlierHighlightEnabled, outlierCells };
});
