import { BasicColumnChartConfiguration } from "@/models/dashboard/chart/column/BasicColumnChartConfiguration";
import type { ColumnChartConfiguration } from "@/models/dashboard/chart/column/ColumnChartConfiguration";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";

export const GetColumnChartTypeConfigurationMap = {
  [ColumnChartType.Basic]: () => new BasicColumnChartConfiguration(),
} as const satisfies Record<ColumnChartType, () => ColumnChartConfiguration>;
