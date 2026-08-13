import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { ColumnChartData } from "@/models/resource/sheet/column/ColumnChartData";
import type { ApexOptions } from "apexcharts";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";

const BASE_CHART_OPTIONS: ApexOptions = { chart: { toolbar: { show: false } } };
// Horizontal bars render their categories bottom-up, so the entries are reversed to keep the
// Largest frequency at the top
const buildTopFrequenciesChartData = (
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

const ColumnChartDataMap: Partial<Record<ColumnType, (statistics: ColumnStatistics) => ColumnChartData | undefined>> = {
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

export const ChartableColumnTypes: ReadonlySet<ColumnType> = new Set(Object.keys(ColumnChartDataMap) as ColumnType[]);

export const computeColumnChartData = (columnStatistics: ColumnStatistics): ColumnChartData | undefined => {
  const compute = ColumnChartDataMap[columnStatistics.columnType];
  return compute ? compute(columnStatistics) : undefined;
};
