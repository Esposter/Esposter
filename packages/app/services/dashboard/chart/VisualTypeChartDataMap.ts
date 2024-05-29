import { VisualType } from "@/models/dashboard/VisualType";
import type { ChartConfiguration } from "@/models/dashboard/chart/ChartConfiguration";
import type { ChartData } from "@/models/dashboard/chart/ChartData";
import { AreaChartType } from "@/models/dashboard/chart/area/AreaChartType";
import { AreaChartTypeDataMap } from "@/models/dashboard/chart/area/AreaChartTypeDataMap";
import { ColumnChartType } from "@/models/dashboard/chart/column/ColumnChartType";
import { ColumnChartTypeDataMap } from "@/models/dashboard/chart/column/ColumnChartTypeDataMap";
import { LineChartType } from "@/models/dashboard/chart/line/LineChartType";
import { LineChartTypeDataMap } from "@/models/dashboard/chart/line/LineChartTypeDataMap";

export const VisualTypeChartDataMap = {
  [VisualType.Area]: AreaChartTypeDataMap[AreaChartType.Basic],
  [VisualType.Column]: ColumnChartTypeDataMap[ColumnChartType.Basic],
  [VisualType.Line]: LineChartTypeDataMap[LineChartType.Basic],
} as const satisfies Record<VisualType, ChartData<ChartConfiguration>>;
