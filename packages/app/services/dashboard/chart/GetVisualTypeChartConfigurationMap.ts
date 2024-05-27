import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartData } from "@/models/dashboard/chart/ChartData";
import { AreaChartConfiguration } from "@/models/dashboard/chart/area/AreaChartConfiguration";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { ColumnChartTypeDataMap } from "@/models/dashboard/chart/column/ColumnChartTypeDataMap";
import { LineChartConfiguration } from "@/models/dashboard/chart/line/LineChartConfiguration";

export const GetVisualTypeChartConfigurationMap = {
  [VisualType.Area]: () => new AreaChartConfiguration(),
  [VisualType.Column]: ColumnChartTypeDataMap[ColumnChartType.Basic],
  [VisualType.Line]: () => new LineChartConfiguration(),
} as const satisfies Record<VisualType, ChartData>;
