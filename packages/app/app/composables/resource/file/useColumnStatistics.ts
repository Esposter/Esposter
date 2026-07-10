import type { ColumnStatistics } from "#shared/models/resource/file/column/ColumnStatistics";

import { computeColumnStatistics } from "@/services/resource/file/column/computeColumnStatistics";
import { useFileStore } from "@/store/resource/file";

export const useColumnStatistics = () => {
  const fileStore = useFileStore();
  const { dataSource } = storeToRefs(fileStore);
  return computed<ColumnStatistics[]>(() => computeColumnStatistics(dataSource.value));
};
