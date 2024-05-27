import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import { AreaChartConfiguration } from "@/models/dashboard/chart/area/AreaChartConfiguration";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { GetColumnChartTypeConfigurationMap } from "@/models/dashboard/chart/column/GetColumnChartTypeConfigurationMap";
import { LineChartConfiguration } from "@/models/dashboard/chart/line/LineChartConfiguration";

export const GetVisualTypeChartConfigurationMap = {
  [VisualType.Area]: () => new AreaChartConfiguration(),
  [VisualType.Column]: GetColumnChartTypeConfigurationMap[ColumnChartType.Basic],
  [VisualType.Line]: () => new LineChartConfiguration(),
} as const satisfies Record<VisualType, () => ChartConfiguration>;
