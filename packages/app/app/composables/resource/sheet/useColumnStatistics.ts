import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";

import { computeColumnStatistics } from "@/services/resource/sheet/column/computeColumnStatistics";
import { useSheetStore } from "@/store/resource/sheet";

export const useColumnStatistics = () => {
  const sheetStore = useSheetStore();
  const { dataSource } = storeToRefs(sheetStore);
  return computed<ColumnStatistics[]>(() => computeColumnStatistics(dataSource.value));
};
