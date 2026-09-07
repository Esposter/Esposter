import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";
import { useSheetStore } from "@/store/resource/sheet";

// Each row is paired with the column it was computed from, so a consumer formatting a statistic in that column's
// Units already holds it. Nested rather than spread onto the statistics: the pairing is what is wanted, and
// Copying every statistic per row to carry one extra field is not. Resolving the column back by its name would
// Be a nominal link standing in for one the mapping already makes structural, and would have to answer for a
// Name that does not resolve
export const useColumnStatistics = () => {
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  return computed(() =>
    dataSource.value.columns.map((column) => ({
      column,
      statistics: computeColumnStatisticsForColumn(dataSource.value, column),
    })),
  );
};
