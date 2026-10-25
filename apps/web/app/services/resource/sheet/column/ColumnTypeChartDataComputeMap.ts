import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnChartData } from "@/models/resource/sheet/column/ColumnChartData";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { buildTopFrequenciesChartData } from "@/services/resource/sheet/column/buildTopFrequenciesChartData";
import { BASE_CHART_OPTIONS } from "@/services/resource/sheet/column/constants";

export const ColumnTypeChartDataComputeMap: Partial<
  Record<ColumnType, (statistics: ColumnStatistics) => ColumnChartData | undefined>
> = {
  [ColumnType.Boolean]: (columnStatistics) => ({
    options: { ...BASE_CHART_OPTIONS, labels: ["True", "False", "Null"] },
    series: [columnStatistics.trueCount ?? 0, columnStatistics.falseCount ?? 0, columnStatistics.nullCount],
    type: "pie",
  }),
  [ColumnType.Date]: (columnStatistics) => buildTopFrequenciesChartData(columnStatistics, false),
  [ColumnType.Number]: (columnStatistics) => {
    if (
      columnStatistics.minimum === undefined ||
      columnStatistics.average === undefined ||
      columnStatistics.maximum === undefined
    )
      return undefined;
    return {
      options: {
        ...BASE_CHART_OPTIONS,
        plotOptions: { bar: { horizontal: true } },
        xaxis: { categories: ["Minimum", "Average", "Maximum"] },
      },
      series: [
        {
          data: [columnStatistics.minimum, columnStatistics.average, columnStatistics.maximum],
          name: columnStatistics.columnName,
        },
      ],
      type: "bar",
    };
  },
  [ColumnType.String]: (columnStatistics) => buildTopFrequenciesChartData(columnStatistics, true),
};
