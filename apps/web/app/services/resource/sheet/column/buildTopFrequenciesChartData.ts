import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnChartData } from "@/models/resource/sheet/column/ColumnChartData";

import { BASE_CHART_OPTIONS } from "@/services/resource/sheet/column/constants";

export const buildTopFrequenciesChartData = (
  columnStatistics: ColumnStatistics,
  isHorizontal: boolean,
): ColumnChartData | undefined => {
  if (!columnStatistics.topFrequencies?.length) return undefined;

  const entries = isHorizontal ? columnStatistics.topFrequencies.toReversed() : columnStatistics.topFrequencies;
  return {
    options: {
      ...BASE_CHART_OPTIONS,
      ...(isHorizontal ? { plotOptions: { bar: { horizontal: true } } } : {}),
      xaxis: { categories: entries.map(([category]) => category) },
    },
    series: [{ data: entries.map(([, count]) => count), name: columnStatistics.columnName }],
    type: "bar",
  };
};
